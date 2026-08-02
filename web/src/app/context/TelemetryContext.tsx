import React, { createContext, useContext, useEffect, useState } from "react";
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
  tempHistory: number[];
  currentHistory: number[];
  refreshTelemetry: () => Promise<void>;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<OperatingMode>("demo");
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Initializing...");
  const [failedPollCount, setFailedPollCount] = useState(0);

  const MAX_HISTORY = 60;
  const [tempHistory, setTempHistory] = useState<number[]>([41.2, 41.8, 42.0, 42.5, 42.8, 42.4, 42.8]);
  const [currentHistory, setCurrentHistory] = useState<number[]>([7.8, 8.0, 8.1, 8.4, 8.2, 8.3, 8.2]);

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

  const setMode = async (newMode: OperatingMode) => {
    setModeState(newMode);
    ApiService.setMode(newMode);
    setFailedPollCount(0);

    if (newMode === "live") {
      setIsConnecting(true);
      const connStatus = await ApiService.testConnection();
      setIsConnecting(false);

      if (connStatus === "blocked") {
        toast.error("Browser Blocked HTTP Call (Mixed Content)", {
          description: `Accessing http://${ApiService.getApiIp()}/api from an HTTPS website was blocked by your browser. Open the ESP32 IP directly or run the app locally on HTTP.`,
          duration: 9000,
        });
        setModeState("demo");
        ApiService.setMode("demo");
      } else if (connStatus === "offline") {
        toast.warning("ESP32 Gateway Offline / Unreachable", {
          description: `Could not reach http://${ApiService.getApiIp()}/api. Verify IP & Wi-Fi connection.`,
          duration: 7000,
        });
      } else {
        toast.success("ESP32 Gateway Connected", {
          description: `Live streaming from http://${ApiService.getApiIp()}/api`,
        });
      }
    } else {
      toast.success("Switched to DEMO Mode", {
        description: "Streaming high-precision simulated telemetry feed",
      });
    }
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
      const [{ metrics, statusState, success }, frame, health] = await Promise.all([
        ApiService.getSensors(),
        ApiService.getThermalFrame(),
        ApiService.getHealth(),
      ]);

      if (mode === "live" && !success) {
        setFailedPollCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            toast.error("ESP32 Gateway Connection Lost", {
              description: `Could not poll http://${ApiService.getApiIp()}/api after 3 attempts. Auto-reverted to Demo Mode.`,
              duration: 6000,
            });
            setModeState("demo");
            ApiService.setMode("demo");
            return 0;
          }
          return next;
        });
        setHasError(true);
      } else {
        setFailedPollCount(0);
        setHasError(false);
      }

      setSensorMetrics(metrics);
      setSensorStatus(statusState);
      setThermalFrame(frame);
      setSystemHealth(health);
      setLastSyncTime(new Date().toLocaleTimeString());

      // Update rolling time-series data buffers for graphs
      if (typeof metrics.hotspotTemp === "number" && !isNaN(metrics.hotspotTemp)) {
        setTempHistory((prev) => {
          const next = [...prev, metrics.hotspotTemp];
          return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
        });
      }

      if (typeof metrics.lineCurrent === "number" && !isNaN(metrics.lineCurrent)) {
        setCurrentHistory((prev) => {
          const next = [...prev, metrics.lineCurrent];
          return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
        });
      }
    } catch (err) {
      console.warn("[TelemetryContext] Telemetry fetch unfulfilled, maintaining safe state", err);
      setHasError(true);
    } finally {
      setIsConnecting(false);
    }
  };

  // Telemetry Polling Loop (2000ms)
  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 2000);
    return () => clearInterval(interval);
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
        tempHistory,
        currentHistory,
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
