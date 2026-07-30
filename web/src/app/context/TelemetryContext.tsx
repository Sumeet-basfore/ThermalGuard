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

const initialSensorMetrics: SensorMetrics = {
  hotspotTemp: 42.8,
  ambientTemp: 27.4,
  humidity: 46,
  lineCurrent: 8.2,
  timestamp: "09:42:18",
};

const initialSensorStatus: SensorStatusState = {
  dht11Connected: true,
  mlx90640Connected: true,
  acs712Connected: true,
  relayConnected: true,
};

const initialThermalFrame: ThermalFrameData = {
  minTemp: 22.1,
  maxTemp: 42.8,
  avgTemp: 29.6,
  hotspotX: 22,
  hotspotY: 14,
  fps: 8.0,
  pixels: [],
};

const initialSystemHealth: SystemHealthMetrics = {
  cpuLoad: 32,
  memoryUsage: 48,
  wifiSignal: 88,
  storageUsage: 22,
};

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<OperatingMode>("demo");
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  const [sensorMetrics, setSensorMetrics] = useState<SensorMetrics>(initialSensorMetrics);
  const [sensorStatus, setSensorStatus] = useState<SensorStatusState>(initialSensorStatus);
  const [thermalFrame, setThermalFrame] = useState<ThermalFrameData>(initialThermalFrame);
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics>(initialSystemHealth);

  const setMode = (newMode: OperatingMode) => {
    setModeState(newMode);
    ApiService.setMode(newMode);
    toast.info(`Switched to ${newMode.toUpperCase()} Mode`, {
      description:
        newMode === "live"
          ? "Targeting ESP32 Gateway REST API (192.168.1.48)..."
          : "Using high-frequency telemetry simulation.",
    });
  };

  // Browser Network Connectivity Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Network Reconnected", { description: "Telemetry API stream resumed." });
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
      const [{ metrics, statusState }, frame, health] = await Promise.all([
        ApiService.getSensors(),
        ApiService.getThermalFrame(),
        ApiService.getHealth(),
      ]);

      setSensorMetrics(metrics);
      setSensorStatus(statusState);
      setThermalFrame(frame);
      setSystemHealth(health);
      setHasError(false);
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
