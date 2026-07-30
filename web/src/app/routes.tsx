import { useState } from "react";
import { createBrowserRouter, Link, Outlet, useLocation } from "react-router";
import {
  Activity, AlertTriangle, ChevronRight, CircleHelp, Cpu, Database,
  Download, Droplets, Flame, Gauge, Home, LayoutDashboard, Power, RefreshCw,
  Settings, Thermometer, Zap, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

import { useTelemetry } from "./context/TelemetryContext";
import { ApiService } from "./services/api";
import { SensorCard } from "./components/thermalguard/SensorCard";
import { SidebarNav } from "./components/thermalguard/SidebarNav";
import { TopHeader } from "./components/thermalguard/TopHeader";
import { TemperatureChart } from "./components/thermalguard/TemperatureChart";
import { PowerChart } from "./components/thermalguard/PowerChart";
import { AlertCard } from "./components/thermalguard/AlertCard";
import { DeviceHealthWidget } from "./components/thermalguard/DeviceHealthWidget";
import { DeviceCard } from "./components/thermalguard/DeviceCard";
import { EventTimeline } from "./components/thermalguard/EventTimeline";
import { GaugeMeter } from "./components/thermalguard/GaugeMeter";
import { TrendIndicator } from "./components/thermalguard/TrendIndicator";
import { ThermalHeatmap } from "./components/thermalguard/ThermalHeatmap";

// 1-to-1 Hardware Mapped Components
import { RelayControlPanel } from "./components/hardware/RelayControlPanel";
import { BuzzerAlarmPanel } from "./components/hardware/BuzzerAlarmPanel";
import { EnvironmentalCard } from "./components/hardware/EnvironmentalCard";
import { CurrentLoadChart } from "./components/hardware/CurrentLoadChart";

const nav = [
  ["/", LayoutDashboard, "Dashboard"],
  ["/thermal-monitor", Activity, "Thermal Monitor"],
  ["/analytics", Gauge, "Analytics"],
  ["/alerts", AlertTriangle, "Alerts"],
  ["/logs", Database, "Logs"],
  ["/devices", Cpu, "Devices"],
] as const;

const secondaryNav = [
  ["/settings", Settings, "Settings"],
  ["/about", CircleHelp, "About"],
] as const;

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded border border-[#434655] bg-[#111318] p-5 transition-colors duration-150 ${className}`}>
      {children}
    </section>
  );
}

function PageHead({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#434655] pb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
          <p className="font-mono text-xs font-medium text-[#8d90a0]">
            ESP32 Node #192.168.1.48 · Substation B
          </p>
        </div>
        <h2 className="mt-1 font-sans text-24px font-semibold tracking-tight text-[#e2e2e9]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#c3c6d7] font-normal">{description}</p>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}

function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { lastSyncTime, mode } = useTelemetry();
  const page =
    [...nav, ...secondaryNav].find(([path]) => path === location.pathname)?.[2] ??
    "Dashboard";

  return (
    <div className="min-h-screen bg-[#111318] font-[Inter] text-[#e2e2e9]">
      <SidebarNav
        navItems={nav}
        secondaryNavItems={secondaryNav}
        open={open}
        setOpen={setOpen}
      />

      <main className="lg:pl-[240px]">
        <TopHeader pageName={page} onOpenMobileMenu={() => setOpen(true)} />

        <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
          <Outlet />
        </div>

        <footer className="mx-6 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#434655] pt-4 font-mono text-xs text-[#8d90a0] lg:mx-8">
          <span>
            ESP32 Firmware <b className="font-semibold text-[#c3c6d7]">v2.4.1</b>
          </span>
          <span>•</span>
          <span>
            Mode <b className="font-semibold text-[#2563eb] uppercase">{mode}</b>
          </span>
          <span>•</span>
          <span>
            Last sync <b className="font-semibold text-[#16A34A]">{lastSyncTime}</b>
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[#16A34A] font-medium">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
            Telemetry Stream Active
          </span>
        </footer>
      </main>
    </div>
  );
}

function Dashboard() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  const sensorCardsList = [
    {
      icon: Flame,
      label: "MLX90640 Max Hotspot",
      value: String(sensorMetrics.hotspotTemp),
      unit: "°C",
      status: sensorStatus.mlx90640Connected ? "Normal" : "Disconnected",
      color: "text-[#D97706]",
      bgColor: "bg-[#D97706]/10",
      stroke: "#D97706",
      fillGrad: "",
      data: [22, 28, 25, 39, 34, 47, 42, 51, 46, 59, 53, sensorMetrics.hotspotTemp],
    },
    {
      icon: Thermometer,
      label: "DHT11 Ambient Temp",
      value: String(sensorMetrics.ambientTemp),
      unit: "°C",
      status: sensorStatus.dht11Connected ? "Normal" : "Disconnected",
      color: "text-[#2563eb]",
      bgColor: "bg-[#2563eb]/10",
      stroke: "#2563eb",
      fillGrad: "",
      data: [39, 42, 38, 45, 41, 49, 45, 52, 48, 50, 47, sensorMetrics.ambientTemp],
    },
    {
      icon: Droplets,
      label: "DHT11 Relative Humidity",
      value: String(sensorMetrics.humidity),
      unit: "% RH",
      status: sensorStatus.dht11Connected ? "Optimal" : "Disconnected",
      color: "text-[#06b6d4]",
      bgColor: "bg-[#06b6d4]/10",
      stroke: "#06b6d4",
      fillGrad: "",
      data: [58, 54, 57, 50, 54, 46, 49, 42, 46, 39, 43, sensorMetrics.humidity],
    },
    {
      icon: Zap,
      label: "ACS712 Line Current",
      value: String(sensorMetrics.lineCurrent),
      unit: "A",
      status: sensorStatus.acs712Connected ? "Normal" : "Disconnected",
      color: "text-[#8b5cf6]",
      bgColor: "bg-[#8b5cf6]/10",
      stroke: "#8b5cf6",
      fillGrad: "",
      data: [31, 36, 34, 44, 39, 48, 43, 51, 46, 57, 50, sensorMetrics.lineCurrent],
    },
  ];

  return (
    <>
      {/* Clean Technical Status Banner */}
      <div className="rounded border border-[#434655] bg-[#1e1f25] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded border border-[#16A34A]/30 bg-[#16A34A]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#16A34A]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              SUBSTATION B PANEL 04 · INTERLOCK ACTIVE
            </div>
            <h2 className="text-24px font-bold text-[#e2e2e9]">
              Thermal Degradation &amp; Overcurrent Monitor
            </h2>
            <p className="mt-1.5 text-sm text-[#c3c6d7]">
              Real-time monitoring of thermal hotspots (MLX90640) and line current load (ACS712) on ESP32 Node 192.168.1.48.
            </p>
          </div>

          <div className="rounded border border-[#434655] bg-[#111318] p-3">
            <GaugeMeter value={99.4} label="Thermal Security" sublabel="PASS" color="#16A34A" size={120} />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <PageHead
            title="Telemetry Channel Grid"
            description="Continuous sensor readings polled from ESP32 REST Gateway"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {sensorCardsList.map((sensor, idx) => (
              <SensorCard key={sensor.label} id={`sensor-${idx}`} {...sensor} />
            ))}
          </div>

          <EnvironmentalCard />
          <TemperatureChart />
        </div>

        <aside className="space-y-6">
          <RelayControlPanel />
          <BuzzerAlarmPanel />
          <DeviceHealthWidget />
          <EventTimeline />
        </aside>
      </div>
    </>
  );
}

function ThermalMonitor() {
  const { mode } = useTelemetry();

  return (
    <>
      <PageHead
        title="MLX90640 Spatial Thermal Array"
        description="32×24 spatial thermal camera matrix (I2C Bus 0x33)"
        action={
          <span className="flex items-center gap-1.5 rounded border border-[#16A34A]/30 bg-[#16A34A]/10 px-3 py-1 font-mono text-xs font-semibold text-[#16A34A]">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> 8.0 FPS · {mode.toUpperCase()}
          </span>
        }
      />

      <Panel className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
          <ThermalHeatmap />

          <div className="border-t border-[#434655] bg-[#111318] p-5 lg:border-l lg:border-t-0 font-mono text-xs">
            <p className="font-semibold text-[#c3c6d7] uppercase">
              Thermal Calibration Scale
            </p>
            <div className="mt-2 h-2.5 rounded bg-gradient-to-r from-blue-900 via-cyan-400 to-rose-600" />
            <div className="mt-1 flex justify-between text-[#8d90a0] font-semibold text-[10px]">
              <span>18°C</span>
              <span>31°C</span>
              <span>45°C</span>
            </div>

            <p className="mt-6 font-semibold text-[#c3c6d7] uppercase">
              Array Telemetry
            </p>
            <dl className="mt-3 space-y-3">
              {[
                ["Maximum Hotspot", "42.8 °C", "text-[#D97706]"],
                ["Minimum Ambient", "22.1 °C", "text-[#2563eb]"],
                ["Mean Grid Temp", "29.6 °C", "text-[#e2e2e9]"],
                ["Hotspot Index", "X: 22, Y: 14", "text-[#06b6d4]"],
                ["Frame Rate", "8.0 FPS", "text-[#16A34A]"],
              ].map(([key, val, valColor]) => (
                <div className="flex justify-between items-center border-b border-[#434655]/50 pb-2" key={key}>
                  <dt className="text-[#c3c6d7] font-sans">{key}</dt>
                  <dd className={`font-bold ${valColor}`}>{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Panel>
    </>
  );
}

function Analytics() {
  const { sensorMetrics } = useTelemetry();

  const cards = [
    { label: "Peak Thermal Delta", val: `${sensorMetrics.hotspotTemp}°C`, delta: "+6.2%", isUp: true, colorClass: "text-[#D97706]", toneClass: "bg-[#D97706]/10" },
    { label: "Energy Consumption", val: "1.84 kWh", delta: "−2.4%", isUp: false, colorClass: "text-[#2563eb]", toneClass: "bg-[#2563eb]/10" },
    { label: "Safety Trip Events", val: "0 Active", delta: "Nominal", isUp: false, colorClass: "text-[#16A34A]", toneClass: "bg-[#16A34A]/10" },
  ];

  return (
    <>
      <PageHead
        title="Power & Load Analytics"
        description="ACS712 current load curves and 24-hour power profiles"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Panel key={c.label}>
            <p className="text-xs font-medium text-[#c3c6d7]">{c.label}</p>
            <p className="mt-2 font-mono text-32px font-bold tracking-tight text-[#e2e2e9]">{c.val}</p>
            <div className="mt-2">
              <TrendIndicator
                value={c.delta}
                label="vs baseline"
                isUp={c.isUp}
                colorClass={c.colorClass}
                toneClass={c.toneClass}
              />
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-6">
        <CurrentLoadChart />
      </div>

      <div className="mt-6">
        <PowerChart />
      </div>
    </>
  );
}

function Alerts() {
  const alertsList = [
    {
      level: "Critical",
      title: "Current Overload Threshold Trip",
      text: "ACS712 (ADC 34) registered 10.1A peak on Line A. GPIO 18 Relay disengaged load line.",
      time: "09:42:18",
      badgeTone: "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab]/30",
      iconTone: "bg-[#ffb4ab]/10 text-[#ffb4ab]",
    },
    {
      level: "Warning",
      title: "Elevated Hotspot Delta Warning",
      text: "MLX90640 registered 4.1°C thermal rise over ambient baseline on Busbar 04.",
      time: "08:53:02",
      badgeTone: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30",
      iconTone: "bg-[#D97706]/10 text-[#D97706]",
    },
    {
      level: "Info",
      title: "Self-Diagnostic Routine Passed",
      text: "ESP32 self-test verified communication on I2C (0x33 MLX90640), GPIO 4 (DHT11), and GPIO 18 (Relay).",
      time: "Yesterday",
      badgeTone: "bg-[#2563eb]/10 text-[#b4c5ff] border-[#2563eb]/30",
      iconTone: "bg-[#2563eb]/10 text-[#b4c5ff]",
    },
  ];

  return (
    <>
      <PageHead
        title="Safety Incidents & Alarm Log"
        description="Log of automated relay trip triggers and acoustic warnings (GPIO 19)"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {alertsList.map((alert) => (
            <AlertCard key={alert.title} {...alert} />
          ))}
        </div>

        <div>
          <BuzzerAlarmPanel />
        </div>
      </div>
    </>
  );
}

function Logs() {
  const { sensorMetrics } = useTelemetry();

  const rows = [
    [sensorMetrics.timestamp, `${sensorMetrics.hotspotTemp}°C`, `${sensorMetrics.lineCurrent}A`, "Triggered", "Open", "Critical"],
    ["09:37:02", "38.2°C", "8.4A", "Clear", "Closed", "Normal"],
    ["09:21:44", "35.6°C", "7.9A", "Clear", "Closed", "Normal"],
    ["08:53:12", "40.1°C", "8.8A", "Warning", "Open", "Warning"],
  ];

  const handleExportCSV = () => {
    toast.success("CSV Export Initiated", {
      description: "Downloading telemetry_event_log_2026.csv...",
    });
  };

  return (
    <>
      <PageHead
        title="Raw Telemetry & Event Logs"
        description="High-resolution time-series sensor output logged from ESP32 memory"
        action={
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded border border-[#434655] bg-[#1e1f25] px-3.5 py-1.5 text-xs font-semibold text-[#e2e2e9] hover:bg-[#282a2f] transition-colors"
          >
            <Download size={14} /> Export Telemetry CSV
          </button>
        }
      />

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-[#434655] bg-[#111318] font-mono text-[11px] uppercase tracking-wider text-[#8d90a0]">
              <tr>
                {["Timestamp", "Hotspot Temp", "Line Current", "Alarm Flag", "Relay State", "Status"].map((x) => (
                  <th className="px-5 py-3 font-semibold" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#434655]/50 font-mono">
              {rows.map((row, i) => (
                <tr className="hover:bg-[#1e1f25]/50 transition-colors" key={i}>
                  <td className="px-5 py-3 text-[#e2e2e9] font-semibold">{row[0]}</td>
                  <td className="px-5 py-3 text-[#D97706] font-bold">{row[1]}</td>
                  <td className="px-5 py-3 text-[#8b5cf6] font-bold">{row[2]}</td>
                  <td className="px-5 py-3 text-[#c3c6d7]">{row[3]}</td>
                  <td className="px-5 py-3 text-[#c3c6d7]">{row[4]}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        row[5] === "Critical"
                          ? "bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30"
                          : row[5] === "Warning"
                          ? "bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/30"
                          : "bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30"
                      }`}
                    >
                      {row[5]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Devices() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  const devices = [
    { icon: Cpu, name: "ESP32 DevKit V1 Gateway", status: "Online", detail: "IP 192.168.1.48 · ESP-WROOM-32 (240MHz)" },
    {
      icon: Thermometer,
      name: "DHT11 Environmental Sensor",
      status: sensorStatus.dht11Connected ? "Connected" : "Disconnected",
      detail: `${sensorMetrics.ambientTemp}°C · ${sensorMetrics.humidity}% RH · GPIO 4`,
    },
    {
      icon: Activity,
      name: "MLX90640 Thermal Camera Array",
      status: sensorStatus.mlx90640Connected ? "Connected" : "Disconnected",
      detail: `8.0 FPS · 32×24 Array · Peak ${sensorMetrics.hotspotTemp}°C · I2C 0x33`,
    },
    {
      icon: Zap,
      name: "ACS712 Current Sensor Module",
      status: sensorStatus.acs712Connected ? "Connected" : "Disconnected",
      detail: `${sensorMetrics.lineCurrent}A Load · ADC Pin 34 (185mV/A)`,
    },
    {
      icon: Power,
      name: "Safety Relay Interlock Circuit",
      status: sensorStatus.relayConnected ? "Connected" : "Disconnected",
      detail: "Active Protection Interlock · GPIO 18",
    },
  ];

  return (
    <>
      <PageHead
        title="Hardware Node Inventory"
        description="Physical sensor mapping and GPIO pin assignments on ESP32 Node B"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {devices.map((device) => (
          <DeviceCard key={device.name} {...device} />
        ))}
      </div>
    </>
  );
}

function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [tempThresh, setTempThresh] = useState("45");
  const [currLimit, setCurrLimit] = useState("10");
  const [alarmDel, setAlarmDel] = useState("5");
  const [relayDel, setRelayDel] = useState("2");

  const handleSave = async () => {
    setSaving(true);
    try {
      await ApiService.saveSettings({
        tempThreshold: parseFloat(tempThresh),
        currentLimit: parseFloat(currLimit),
        alarmDelay: parseFloat(alarmDel),
        relayTripDelay: parseFloat(relayDel),
      });
      toast.success("EEPROM Parameters Updated", {
        description: "Safety rules written to ESP32 Flash memory.",
      });
    } catch (err) {
      toast.error("EEPROM Write Failed", {
        description: "Could not write parameters to ESP32 node.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHead
        title="Protection Thresholds & EEPROM Config"
        description="Hardware interlock parameters written to ESP32 Flash memory"
      />

      <Panel className="max-w-2xl">
        <h3 className="text-base font-bold text-[#e2e2e9]">Hardware Trip Thresholds</h3>
        <p className="mt-0.5 text-xs text-[#c3c6d7]">
          Threshold settings are written directly to ESP32 non-volatile EEPROM storage.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-[#c3c6d7]">Hotspot Trip Temperature</span>
            <div className="mt-1.5 flex rounded border border-[#434655] bg-[#111318] px-3 py-2">
              <input
                value={tempThresh}
                onChange={(e) => setTempThresh(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-[#e2e2e9] outline-none"
              />
              <span className="font-mono text-xs font-medium text-[#8d90a0]">°C</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[#c3c6d7]">Overcurrent Limit (ACS712)</span>
            <div className="mt-1.5 flex rounded border border-[#434655] bg-[#111318] px-3 py-2">
              <input
                value={currLimit}
                onChange={(e) => setCurrLimit(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-[#e2e2e9] outline-none"
              />
              <span className="font-mono text-xs font-medium text-[#8d90a0]">A</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[#c3c6d7]">Buzzer Alarm Delay</span>
            <div className="mt-1.5 flex rounded border border-[#434655] bg-[#111318] px-3 py-2">
              <input
                value={alarmDel}
                onChange={(e) => setAlarmDel(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-[#e2e2e9] outline-none"
              />
              <span className="font-mono text-xs font-medium text-[#8d90a0]">sec</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[#c3c6d7]">Relay Disconnect Delay</span>
            <div className="mt-1.5 flex rounded border border-[#434655] bg-[#111318] px-3 py-2">
              <input
                value={relayDel}
                onChange={(e) => setRelayDel(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-[#e2e2e9] outline-none"
              />
              <span className="font-mono text-xs font-medium text-[#8d90a0]">sec</span>
            </div>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2563eb]/80 transition-colors disabled:opacity-50"
        >
          {saving ? "Writing to EEPROM..." : "Write to ESP32 Flash"}
        </button>
      </Panel>
    </>
  );
}

function About() {
  return (
    <>
      <PageHead
        title="ThermalGuard System Specification"
        description="Architecture details for MLX90640 + ACS712 edge monitoring"
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Panel>
          <h3 className="text-24px font-bold text-[#e2e2e9]">
            Electrical Thermal Degradation Monitoring
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#c3c6d7]">
            ThermalGuard integrates 32×24 spatial thermal imaging (MLX90640), ambient environmental sensing (DHT11), and high-frequency current monitoring (ACS712) into a unified ESP32 edge node to isolate micro-hotspots prior to electrical insulation breakdown.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["IR Sensor Array", "MLX90640 (I2C 0x33)"],
              ["Edge Processor", "ESP32 DevKit V1 (240MHz)"],
              ["Current Sensor", "ACS712 (185mV/A)"],
            ].map(([a, b]) => (
              <div className="rounded border border-[#434655] bg-[#111318] p-3.5" key={a}>
                <p className="font-mono text-xs font-bold text-[#2563eb]">{a}</p>
                <p className="mt-1 text-xs text-[#c3c6d7] font-medium">{b}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#8d90a0]">
            Firmware Build
          </p>
          <p className="mt-2 font-mono text-32px font-bold text-[#e2e2e9]">v2.4.1</p>
          <p className="mt-1 text-xs text-[#c3c6d7] font-mono">PlatformIO Core 6.1.11</p>
          <Link
            to="/devices"
            className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:underline"
          >
            Hardware Inventory <ChevronRight size={14} />
          </Link>
        </Panel>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <div className="max-w-md rounded border border-[#434655] bg-[#1e1f25] p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded border border-[#D97706]/30 bg-[#D97706]/10 text-[#D97706]">
          <ShieldAlert size={24} />
        </div>
        <p className="mt-4 font-mono text-32px font-bold text-[#e2e2e9]">
          404
        </p>
        <h2 className="mt-1 text-base font-bold text-[#e2e2e9]">Unknown Route Path</h2>
        <p className="mt-2 text-xs text-[#c3c6d7]">
          The requested path does not map to any active telemetry channel or hardware configuration view.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded bg-[#2563eb] py-2 text-xs font-semibold text-white hover:bg-[#2563eb]/80 transition-colors"
          >
            <Home size={16} /> Operations Dashboard
          </Link>
          <Link
            to="/thermal-monitor"
            className="rounded border border-[#434655] bg-[#111318] py-2 text-xs font-semibold text-[#c3c6d7] hover:text-[#e2e2e9] transition-colors"
          >
            MLX90640 Thermal Grid →
          </Link>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Shell,
    children: [
      { index: true, Component: Dashboard },
      { path: "thermal-monitor", Component: ThermalMonitor },
      { path: "analytics", Component: Analytics },
      { path: "alerts", Component: Alerts },
      { path: "logs", Component: Logs },
      { path: "devices", Component: Devices },
      { path: "settings", Component: SettingsPage },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);
