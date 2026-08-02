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

// ─── Internal helper ──────────────────────────────────────────────────────────
/** Performs a timed fetch with AbortController, returns null on any failure. */
async function timedFetch(url: string, timeoutMs: number, options?: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res.ok ? res : null;
  } catch (_) {
    clearTimeout(id);
    return null;
  }
}

export class ApiService {
  private static mode: OperatingMode = "demo";
  private static timeoutMs = 3000; // 3000ms — extra headroom for slow ESP32 socket responses

  public static setMode(mode: OperatingMode) {
    this.mode = mode;
  }

  public static getMode(): OperatingMode {
    return this.mode;
  }

  /**
   * Detect if the page is on HTTPS while the ESP32 is a plain HTTP endpoint.
   * Modern browsers block these (mixed content), causing silent connection failures.
   */
  public static isMixedContentRisk(): boolean {
    return (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      !!activeIp
    );
  }

  /**
   * Fetches real-time sensor readings from ESP32.
   * On first failure: waits 500ms and retries once before reporting failure.
   * Request is serialized first in the polling sequence.
   */
  public static async getSensors(): Promise<{
    metrics: SensorMetrics;
    statusState: SensorStatusState;
    success: boolean;
  }> {
    if (this.mode === "live") {
      const tryFetch = async () => {
        const res = await timedFetch(`${activeEndpoint}/sensors`, this.timeoutMs);
        if (!res) return null;
        const raw = await res.json();
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
      };

      const first = await tryFetch();
      if (first) return first;

      // Retry once after 500ms — handles transient ESP32 socket busy errors
      await new Promise((r) => setTimeout(r, 500));
      console.warn("[API] /sensors: first attempt failed, retrying...");
      const second = await tryFetch();
      if (second) return second;

      console.warn("[API] /sensors: retry failed — engaging safe defaults");
      return {
        metrics: SAFE_SENSOR_DEFAULTS,
        statusState: { dht11Connected: false, mlx90640Connected: false, acs712Connected: false, relayConnected: false },
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
      statusState: { dht11Connected: true, mlx90640Connected: true, acs712Connected: true, relayConnected: true },
      success: true,
    };
  }

  /**
   * Fetches the MLX90640 768-pixel thermal frame.
   * Staggered +200ms after sensors to prevent single-socket collision on ESP32.
   */
  public static async getThermalFrame(): Promise<ThermalFrameData> {
    if (this.mode === "live") {
      await new Promise((r) => setTimeout(r, 200)); // Serialize after /sensors
      const res = await timedFetch(`${activeEndpoint}/thermal`, this.timeoutMs);
      if (res) {
        const raw = await res.json();
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
      return SAFE_THERMAL_DEFAULTS;
    }

    // Demo Mode: animate a wandering Gaussian hotspot across the 32×24 grid
    const hotX = Math.max(4, Math.min(27, 16 + Math.round((Math.random() - 0.5) * 10)));
    const hotY = Math.max(2, Math.min(21, 12 + Math.round((Math.random() - 0.5) * 8)));
    const maxT = Number((42.8 + (Math.random() - 0.5) * 1.5).toFixed(1));
    const minT = 21.5;
    const pixels = Array.from({ length: 768 }, (_, i) => {
      const x = i % 32;
      const y = Math.floor(i / 32);
      const dist = Math.sqrt(Math.pow(x - hotX, 2) + Math.pow(y - hotY, 2));
      const falloff = Math.exp((-dist * dist) / 24.0);
      return Number((minT + (maxT - minT) * falloff + (Math.random() - 0.5) * 0.25).toFixed(2));
    });

    return { minTemp: minT, maxTemp: maxT, avgTemp: 29.6, hotspotX: hotX, hotspotY: hotY, fps: 8.0, pixels };
  }

  /**
   * Fetches system health metrics.
   * Staggered +400ms after sensors to be 3rd in the sequential chain.
   */
  public static async getHealth(): Promise<SystemHealthMetrics> {
    if (this.mode === "live") {
      await new Promise((r) => setTimeout(r, 400)); // Serialize after /sensors and /thermal
      const res = await timedFetch(`${activeEndpoint}/health`, this.timeoutMs);
      if (res) {
        return await res.json();
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
    const res = await timedFetch(`${activeEndpoint}/test-buzzer`, 2000, { method: "POST" });
    return res !== null;
  }

  /**
   * Sends protective threshold updates to ESP32 Flash EEPROM.
   */
  public static async saveSettings(settings: SystemSettings): Promise<boolean> {
    if (this.mode === "live") {
      const res = await timedFetch(`${activeEndpoint}/settings`, 4000, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      return res !== null;
    }

    await new Promise((r) => setTimeout(r, 800));
    return true;
  }
}
