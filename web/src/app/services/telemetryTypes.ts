export type OperatingMode = "live" | "demo";

export interface SensorMetrics {
  hotspotTemp: number;
  ambientTemp: number;
  humidity: number;
  lineCurrent: number;
  timestamp: string;
  safetyState?: "NORMAL" | "WARNING" | "ALARM_ACTIVE" | "ALARM_SILENCED";
  alarmReason?: string;
  spikeRate?: number;
  graceRemainingSec?: number;
  graceDelaySec?: number;
  spikeLimit?: number;
}

export interface SystemHealthMetrics {
  cpuLoad: number;
  memoryUsage: number;
  wifiSignal: number;
  storageUsage: number;
}

export interface ThermalFrameData {
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  hotspotX: number;
  hotspotY: number;
  fps: number;
  pixels: number[];
}

export interface SafetyAlert {
  id: string;
  level: "Critical" | "Warning" | "Info";
  title: string;
  text: string;
  time: string;
  timestamp: number;
  reviewed?: boolean;
}

export interface DeviceStatus {
  id: string;
  name: string;
  status: "Online" | "Connected" | "Degraded" | "Offline";
  detail: string;
  ipAddress?: string;
}

export interface SystemSettings {
  tempThreshold: number;
  currentLimit: number;
  alarmDelay: number;
  relayTripDelay: number;
  graceDelay?: number;
  spikeLimit?: number;
}
