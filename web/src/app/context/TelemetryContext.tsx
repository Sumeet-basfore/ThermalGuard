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
    setFailedPollCount(0);
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
      const [{ metrics, statusState, success }, frame, health] = await Promise.all([
        ApiService.getSensors(),
        ApiService.getThermalFrame(),
        ApiService.getHealth(),
      ]);

      if (mode === "live" && !success) {
        setFailedPollCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            toast.error("ESP32 Gateway Timeout / Mixed Content Block", {
              description:
                "Browser blocked HTTP call to http://192.168.4.1 or device is offline. Auto-engaged Demo Mode.",
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
