import {
  DeviceStatus,
  OperatingMode,
  SafetyAlert,
  SensorMetrics,
  SystemHealthMetrics,
  SystemSettings,
  ThermalFrameData,
} from "./telemetryTypes";

// Central ESP32 Gateway Base Endpoint (Defaults to 192.168.4.1 for ThermoGuard_AP SoftAP)
export const ESP32_DEFAULT_IP = "192.168.4.1";

function getInitialIp(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("TG_GATEWAY_IP");
    if (saved && saved.trim()) return saved.trim();
  }
  return ESP32_DEFAULT_IP;
}

let activeIp = getInitialIp();
let activeEndpoint = `http://${activeIp}/api`;

export function setApiEndpoint(ip: string) {
  activeIp = ip.trim();
  activeEndpoint = `http://${activeIp}/api`;
  if (typeof window !== "undefined") {
    localStorage.setItem("TG_GATEWAY_IP", activeIp);
  }
}

export function getApiIp(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("TG_GATEWAY_IP");
    if (saved && saved.trim()) {
      activeIp = saved.trim();
      activeEndpoint = `http://${activeIp}/api`;
    }
  }
  return activeIp;
}

export function getBaseUrl(): string {
  const ip = getApiIp();
  return `http://${ip}/api`;
}

// Default Safe Telemetry Objects (Guarantees zero UI crashes on sensor disconnects)
export const SAFE_SENSOR_DEFAULTS: SensorMetrics = {
  hotspotTemp: 25.0,
  ambientTemp: 24.0,
  humidity: 50,
  lineCurrent: 0.0,
  timestamp: "--:--:--",
};

export const SAFE_THERMAL_DEFAULTS: ThermalFrameData = {
  minTemp: 20.0,
  maxTemp: 25.0,
  avgTemp: 22.5,
  hotspotX: 16,
  hotspotY: 12,
  fps: 8.0,
  pixels: new Array(768).fill(22.5),
};

export const SAFE_HEALTH_DEFAULTS: SystemHealthMetrics = {
  cpuLoad: 0,
  memoryUsage: 0,
  wifiSignal: 0,
  storageUsage: 0,
};

export interface SensorStatusState {
  dht11Connected: boolean;
  mlx90640Connected: boolean;
  acs712Connected: boolean;
  relayConnected: boolean;
}

export class ApiService {
  private static mode: OperatingMode = "demo";
  private static timeoutMs = 2000; // 2000ms API Timeout Limit

  public static setMode(mode: OperatingMode) {
    this.mode = mode;
  }

  public static getMode(): OperatingMode {
    return this.mode;
  }

  /**
   * Fast connection test to determine reachable vs blocked vs offline status.
   */
  public static async testConnection(): Promise<"ok" | "blocked" | "offline"> {
    try {
      const endpoint = getBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(`${endpoint}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok ? "ok" : "offline";
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return "offline";
      }
      if (typeof window !== "undefined" && window.location.protocol === "https:") {
        return "blocked";
      }
      return "offline";
    }
  }

  /**
   * Fetches real-time sensor readings from ESP32 with strict 2000ms AbortController timeout.
   */
  public static async getSensors(): Promise<{
    metrics: SensorMetrics;
    statusState: SensorStatusState;
    success: boolean;
  }> {
    if (this.mode === "live") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${getBaseUrl()}/sensors`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const raw = await response.json();
          const validHotspot = typeof raw.hotspotTemp === "number" && !isNaN(raw.hotspotTemp);
          const validAmbient = typeof raw.ambientTemp === "number" && !isNaN(raw.ambientTemp);
          const validCurrent = typeof raw.lineCurrent === "number" && !isNaN(raw.lineCurrent);

          return {
            metrics: {
              hotspotTemp: validHotspot ? raw.hotspotTemp : SAFE_SENSOR_DEFAULTS.hotspotTemp,
              ambientTemp: validAmbient ? raw.ambientTemp : SAFE_SENSOR_DEFAULTS.ambientTemp,
              humidity: typeof raw.humidity === "number" && !isNaN(raw.humidity) ? raw.humidity : SAFE_SENSOR_DEFAULTS.humidity,
              lineCurrent: validCurrent ? raw.lineCurrent : SAFE_SENSOR_DEFAULTS.lineCurrent,
              timestamp: raw.timestamp || new Date().toLocaleTimeString(),
            },
            statusState: {
              dht11Connected: validAmbient,
              mlx90640Connected: validHotspot,
              acs712Connected: validCurrent,
              relayConnected: true,
            },
            success: true,
          };
        }
      } catch (err) {
        console.warn("[API Service] REST call timed out or failed, engaging safe defaults", err);
      }

      return {
        metrics: SAFE_SENSOR_DEFAULTS,
        statusState: {
          dht11Connected: false,
          mlx90640Connected: false,
          acs712Connected: false,
          relayConnected: false,
        },
        success: false,
      };
    }

    // Demo Mode Simulation
    const now = new Date();
    const noise = (Math.random() - 0.5) * 0.4;

    return {
      metrics: {
        hotspotTemp: Number((42.8 + noise).toFixed(1)),
        ambientTemp: Number((27.4 + noise * 0.5).toFixed(1)),
        humidity: Math.round(46 + (Math.random() - 0.5) * 2),
        lineCurrent: Number((8.2 + (Math.random() - 0.5) * 0.2).toFixed(1)),
        timestamp: now.toLocaleTimeString(),
      },
      statusState: {
        dht11Connected: true,
        mlx90640Connected: true,
        acs712Connected: true,
        relayConnected: true,
      },
      success: true,
    };
  }

  /**
   * Fetches thermal array frame data with timeout.
   */
  public static async getThermalFrame(): Promise<ThermalFrameData> {
    if (this.mode === "live") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${getBaseUrl()}/thermal`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const raw = await response.json();
          return {
            minTemp: typeof raw.minTemp === "number" ? raw.minTemp : SAFE_THERMAL_DEFAULTS.minTemp,
            maxTemp: typeof raw.maxTemp === "number" ? raw.maxTemp : SAFE_THERMAL_DEFAULTS.maxTemp,
            avgTemp: typeof raw.avgTemp === "number" ? raw.avgTemp : SAFE_THERMAL_DEFAULTS.avgTemp,
            hotspotX: raw.hotspotX ?? SAFE_THERMAL_DEFAULTS.hotspotX,
            hotspotY: raw.hotspotY ?? SAFE_THERMAL_DEFAULTS.hotspotY,
            fps: raw.fps ?? 8.0,
            pixels: Array.isArray(raw.pixels) ? raw.pixels : SAFE_THERMAL_DEFAULTS.pixels,
          };
        }
      } catch (err) {
        console.warn("[API Service] Thermal frame request timed out", err);
      }
      return SAFE_THERMAL_DEFAULTS;
    }

    // Demo Mode Simulation
    const noise = (Math.random() - 0.5) * 0.5;
    return {
      minTemp: 22.1,
      maxTemp: Number((42.8 + noise).toFixed(1)),
      avgTemp: 29.6,
      hotspotX: 22,
      hotspotY: 14,
      fps: 8.0,
      pixels: new Array(768).fill(25.0),
    };
  }

  /**
   * Fetches system health metrics.
   */
  public static async getHealth(): Promise<SystemHealthMetrics> {
    if (this.mode === "live") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
        const response = await fetch(`${getBaseUrl()}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn("[API Service] Health request timed out", err);
      }
      return SAFE_HEALTH_DEFAULTS;
    }

    return {
      cpuLoad: Math.round(32 + (Math.random() - 0.5) * 4),
      memoryUsage: 48,
      wifiSignal: 88,
      storageUsage: 22,
    };
  }

  /**
   * Triggers physical ESP32 GPIO 19 Buzzer Alarm beep test.
   */
  public static async triggerBuzzerTest(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${getBaseUrl()}/test-buzzer`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      console.warn("[API Service] Buzzer test call failed or offline", err);
      return false;
    }
  }

  /**
   * Silences active physical ESP32 GPIO 19 Buzzer alarm while maintaining relay trip safety.
   */
  public static async silenceBuzzer(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${getBaseUrl()}/silence-buzzer`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      console.warn("[API Service] Silence buzzer call failed or offline", err);
      return false;
    }
  }

  /**
   * Sends protective threshold updates to ESP32 Flash EEPROM.
   */
  public static async saveSettings(settings: SystemSettings): Promise<boolean> {
    if (this.mode === "live") {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${getBaseUrl()}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    }

    await new Promise((res) => setTimeout(res, 800));
    return true;
  }
}
