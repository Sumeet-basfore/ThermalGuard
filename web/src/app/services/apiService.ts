import {
  DeviceStatus,
  OperatingMode,
  SafetyAlert,
  SensorMetrics,
  SystemHealthMetrics,
  SystemSettings,
  ThermalFrameData,
} from "./telemetryTypes";

const ESP32_BASE_URL = "http://192.168.1.48/api";

export class ApiService {
  private static mode: OperatingMode = "demo";

  public static setMode(mode: OperatingMode) {
    this.mode = mode;
  }

  public static getMode(): OperatingMode {
    return this.mode;
  }

  /**
   * Fetches current sensor telemetry.
   */
  public static async fetchSensorMetrics(): Promise<SensorMetrics> {
    if (this.mode === "live") {
      try {
        const response = await fetch(`${ESP32_BASE_URL}/sensors`, {
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        console.warn("Live ESP32 fetch failed, falling back to simulated data", err);
      }
    }

    // Demo Mode / Fallback Simulation with realistic variance
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const tempNoise = (Math.random() - 0.5) * 0.4;
    const currentNoise = (Math.random() - 0.5) * 0.2;

    return {
      hotspotTemp: Number((42.8 + tempNoise).toFixed(1)),
      ambientTemp: Number((27.4 + tempNoise * 0.5).toFixed(1)),
      humidity: Math.round(46 + (Math.random() - 0.5) * 2),
      lineCurrent: Number((8.2 + currentNoise).toFixed(1)),
      timestamp: timeStr,
    };
  }

  /**
   * Fetches MLX90640 thermal array data.
   */
  public static async fetchThermalFrame(): Promise<ThermalFrameData> {
    if (this.mode === "live") {
      try {
        const response = await fetch(`${ESP32_BASE_URL}/mlx90640`, {
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        console.warn("Thermal frame live fetch failed", err);
      }
    }

    // Demo Mode Simulation
    const tempNoise = (Math.random() - 0.5) * 0.6;
    return {
      minTemp: 22.1,
      maxTemp: Number((42.8 + tempNoise).toFixed(1)),
      avgTemp: 29.6,
      hotspotX: 22,
      hotspotY: 14,
      fps: 8.0,
      pixels: new Array(768).fill(25.0),
    };
  }

  /**
   * Fetches system health diagnostics.
   */
  public static async fetchSystemHealth(): Promise<SystemHealthMetrics> {
    return {
      cpuLoad: Math.round(32 + (Math.random() - 0.5) * 4),
      memoryUsage: 48,
      wifiSignal: 88,
      storageUsage: 22,
    };
  }

  /**
   * Saves protective threshold rules to ESP32 / Backend.
   */
  public static async saveSettings(settings: SystemSettings): Promise<boolean> {
    if (this.mode === "live") {
      try {
        const response = await fetch(`${ESP32_BASE_URL}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
          signal: AbortSignal.timeout(4000),
        });
        return response.ok;
      } catch (err) {
        console.error("Failed to post settings to ESP32", err);
        throw err;
      }
    }

    // Demo Mode simulation delay
    await new Promise((res) => setTimeout(res, 800));
    return true;
  }
}
