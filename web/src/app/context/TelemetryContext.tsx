import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiService, SensorStatusState } from "../services/api";
import {
  OperatingMode,
  SensorMetrics,
  SystemHealthMetrics,
  ThermalFrameData,
} from "../services/telemetryTypes";

interface TelemetryContextType {
  mode: OperatingMode;
  setMode: (mode: OperatingMode) => void;
  isOnline: boolean;
  isConnecting: boolean;
  hasError: boolean;
  lastSyncTime: string;
  sensorMetrics: SensorMetrics;
  sensorStatus: SensorStatusState;
  thermalFrame: ThermalFrameData;
  systemHealth: SystemHealthMetrics;
  refreshTelemetry: () => Promise<void>;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const FAIL_THRESHOLD = 5;           // Falls back to Demo after 5 consecutive failures (was 3)
const BASE_POLL_INTERVAL_MS = 2000; // Normal polling cadence
const MAX_BACKOFF_MS = 8000;        // Maximum backoff delay on repeated failures

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<OperatingMode>("demo");
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Initializing...");
  const [failedPollCount, setFailedPollCount] = useState(0);
  const failedCountRef = useRef(0); // Ref copy for accurate closure access in async callbacks
  const backoffRef = useRef(BASE_POLL_INTERVAL_MS);

  const [sensorMetrics, setSensorMetrics] = useState<SensorMetrics>({
    hotspotTemp: 42.8,
    ambientTemp: 27.4,
    humidity: 46,
    lineCurrent: 8.2,
    timestamp: "Just now",
  });

  const [sensorStatus, setSensorStatus] = useState<SensorStatusState>({
    dht11Connected: true,
    mlx90640Connected: true,
    acs712Connected: true,
    relayConnected: true,
  });

  const [thermalFrame, setThermalFrame] = useState<ThermalFrameData>({
    minTemp: 22.1,
    maxTemp: 42.8,
    avgTemp: 29.6,
    hotspotX: 22,
    hotspotY: 14,
    fps: 8.0,
    pixels: new Array(768).fill(25.0),
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics>({
    cpuLoad: 32,
    memoryUsage: 48,
    wifiSignal: 88,
    storageUsage: 22,
  });

  const setMode = (newMode: OperatingMode) => {
    setModeState(newMode);
    ApiService.setMode(newMode);
    failedCountRef.current = 0;
    backoffRef.current = BASE_POLL_INTERVAL_MS;
    setFailedPollCount(0);
    setHasError(false);

    // Mixed content warning: HTTPS page cannot reach plain HTTP ESP32
    if (newMode === "live" && ApiService.isMixedContentRisk()) {
      toast.warning("⚠ Mixed Content Warning", {
        description:
          "This page is served over HTTPS. Browsers block plain HTTP requests to the ESP32. " +
          "Open the dashboard via http:// instead, or use a local network proxy.",
        duration: 8000,
      });
    }

    toast.success(`Switched to ${newMode.toUpperCase()} Mode`, {
      description:
        newMode === "live"
          ? `Polling ESP32 Gateway Node (http://${ApiService.getApiIp()}/api)`
          : "Streaming high-precision simulated telemetry feed",
    });
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Network Reconnected");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Offline Mode Triggered", { description: "Network connection lost." });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refreshTelemetry = async () => {
    if (!isOnline) return;
    setIsConnecting(true);

    try {
      // Sequential fetch pattern: sensors first, then thermal (+200ms), then health (+400ms)
      // This prevents the ESP32 single-socket HTTP server from getting overwhelmed
      const [{ metrics, statusState, success }, frame, health] = await Promise.all([
        ApiService.getSensors(),
        ApiService.getThermalFrame(),
        ApiService.getHealth(),
      ]);

      if (mode === "live" && !success) {
        failedCountRef.current += 1;
        const count = failedCountRef.current;

        if (count >= FAIL_THRESHOLD) {
          // After FAIL_THRESHOLD failures: auto-engage Demo Mode
          toast.error("ESP32 Gateway Unreachable", {
            description:
              `${count} consecutive failures. Switching to Demo Mode. ` +
              (ApiService.isMixedContentRisk()
                ? "Likely cause: Mixed Content block (HTTPS → HTTP). Open via http://."
                : "Check ESP32 power and Wi-Fi. Configure IP via the settings icon."),
            duration: 8000,
          });
          setModeState("demo");
          ApiService.setMode("demo");
          failedCountRef.current = 0;
          backoffRef.current = BASE_POLL_INTERVAL_MS;
        } else {
          // Progressive backoff: double delay up to MAX_BACKOFF_MS
          backoffRef.current = Math.min(backoffRef.current * 1.5, MAX_BACKOFF_MS);
          toast.warning(`ESP32 Reconnecting... (${count}/${FAIL_THRESHOLD})`, {
            description: `Next retry in ${(backoffRef.current / 1000).toFixed(1)}s`,
            duration: 3000,
          });
        }

        setFailedPollCount(count);
        setHasError(true);
      } else {
        // Success: reset counters and backoff
        failedCountRef.current = 0;
        backoffRef.current = BASE_POLL_INTERVAL_MS;
        setFailedPollCount(0);
        setHasError(false);
      }

      setSensorMetrics(metrics);
      setSensorStatus(statusState);
      setThermalFrame(frame);
      setSystemHealth(health);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn("[TelemetryContext] Telemetry fetch unfulfilled, maintaining safe state", err);
      setHasError(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // Adaptive polling loop with exponential backoff on failures
  useEffect(() => {
    refreshTelemetry();
    const scheduleNext = () => {
      const delay = hasError && mode === "live" ? backoffRef.current : BASE_POLL_INTERVAL_MS;
      const id = setTimeout(async () => {
        await refreshTelemetry();
        scheduleNext();
      }, delay);
      return id;
    };
    const id = scheduleNext();
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isOnline]);

  return (
    <TelemetryContext.Provider
      value={{
        mode,
        setMode,
        isOnline,
        isConnecting,
        hasError,
        lastSyncTime,
        sensorMetrics,
        sensorStatus,
        thermalFrame,
        systemHealth,
        refreshTelemetry,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
