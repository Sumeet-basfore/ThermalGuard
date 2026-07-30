import { useState } from "react";
import { createBrowserRouter, Link, Outlet, useLocation } from "react-router";
import {
  Activity, AlertTriangle, Check, ChevronRight, CircleHelp, Cpu, Database,
  Download, Droplets, Filter, Flame, Gauge, Home, LayoutDashboard, Power, RefreshCw,
  Settings, Thermometer, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.section
      whileHover={hover ? { y: -2, borderColor: "rgba(255, 255, 255, 0.16)" } : undefined}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 backdrop-blur-xl shadow-xl shadow-black/30 transition-all duration-300 ${className}`}
    >
      {children}
    </motion.section>
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            Operations Console
          </p>
        </div>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-400 md:text-sm">{description}</p>
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
    <div className="min-h-screen bg-[#070b14] bg-grid-pattern font-[Inter] text-slate-100 selection:bg-blue-500/30">
      {/* Reusable Sidebar Navigation */}
      <SidebarNav
        navItems={nav}
        secondaryNavItems={secondaryNav}
        open={open}
        setOpen={setOpen}
      />

      {/* Main Layout Area */}
      <main className="lg:pl-[260px]">
        {/* Reusable Top Header Bar */}
        <TopHeader pageName={page} onOpenMobileMenu={() => setOpen(true)} />

        {/* Animated Route View Outlet */}
        <div className="mx-auto max-w-[1600px] p-5 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mx-5 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.08] px-1 pt-4 text-[11px] text-slate-500 lg:mx-8">
          <span>
            Firmware <b className="font-semibold text-slate-300">v2.4.1</b>
          </span>
          <span className="text-slate-700">•</span>
          <span>ESP32 PlatformIO</span>
          <span className="text-slate-700">•</span>
          <span>
            Mode <b className="font-semibold text-blue-400 uppercase">{mode}</b>
          </span>
          <span className="text-slate-700">•</span>
          <span>
            Last sync <b className="font-semibold text-emerald-400">{lastSyncTime}</b>
          </span>
          <span className="ml-auto flex items-center gap-2 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
            </span>
            Telemetry REST API operational
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
      label: "Hotspot Temperature (MLX90640)",
      value: String(sensorMetrics.hotspotTemp),
      unit: "°C",
      status: sensorStatus.mlx90640Connected ? "Stable" : "Disconnected",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10 border-amber-400/20",
      stroke: "#f59e0b",
      fillGrad: "url(#grad-amber)",
      data: [22, 28, 25, 39, 34, 47, 42, 51, 46, 59, 53, sensorMetrics.hotspotTemp],
    },
    {
      icon: Thermometer,
      label: "Ambient Temperature (DHT11)",
      value: String(sensorMetrics.ambientTemp),
      unit: "°C",
      status: sensorStatus.dht11Connected ? "Normal" : "Disconnected",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10 border-blue-400/20",
      stroke: "#3b82f6",
      fillGrad: "url(#grad-blue)",
      data: [39, 42, 38, 45, 41, 49, 45, 52, 48, 50, 47, sensorMetrics.ambientTemp],
    },
    {
      icon: Droplets,
      label: "Relative Humidity (DHT11)",
      value: String(sensorMetrics.humidity),
      unit: "% RH",
      status: sensorStatus.dht11Connected ? "Optimal" : "Disconnected",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10 border-cyan-400/20",
      stroke: "#06b6d4",
      fillGrad: "url(#grad-cyan)",
      data: [58, 54, 57, 50, 54, 46, 49, 42, 46, 39, 43, sensorMetrics.humidity],
    },
    {
      icon: Zap,
      label: "Line Current Load (ACS712)",
      value: String(sensorMetrics.lineCurrent),
      unit: "A",
      status: sensorStatus.acs712Connected ? "Normal" : "Disconnected",
      color: "text-violet-400",
      bgColor: "bg-violet-400/10 border-violet-400/20",
      stroke: "#8b5cf6",
      fillGrad: "url(#grad-violet)",
      data: [31, 36, 34, 44, 39, 48, 43, 51, 46, 57, 50, sensorMetrics.lineCurrent],
    },
  ];

  return (
    <>
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0d1728] via-[#111d33] to-[#0f182c] p-6 lg:p-8 shadow-2xl shadow-black/40"
      >
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              All Hardware Sensors Operational
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Predictive Fire Prevention, <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Always Active.</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              High-frequency MLX90640 thermal camera array, DHT11 environmental sensor, and ACS712 current monitoring streaming to ESP32 DevKit V1.
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
            <GaugeMeter value={99.4} label="Security Index" sublabel="OPTIMAL" color="#22c55e" size={130} />
          </div>
        </div>
      </motion.div>

      {/* Main Grid Content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <PageHead
            title="Hardware Telemetry Grid"
            description="Real-time sensor metrics streamed from ESP32 Edge Gateway"
          />

          {/* Live Sensor Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {sensorCardsList.map((sensor, idx) => (
              <SensorCard key={sensor.label} id={`sensor-${idx}`} {...sensor} />
            ))}
          </div>

          {/* Mapped DHT11 Environmental Card */}
          <EnvironmentalCard />

          {/* Reusable Temperature History Chart */}
          <TemperatureChart />
        </div>

        {/* Right Hardware Control & Event Column */}
        <aside className="space-y-6">
          {/* Mapped Relay Control Panel */}
          <RelayControlPanel />

          {/* Mapped Buzzer Alarm Panel */}
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
        title="MLX90640 Thermal Monitor"
        description="High-definition spatial thermal array mapping (I2C 0x33, 32×24 pixels)"
        action={
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live Heat Feed · 8 FPS ({mode.toUpperCase()})
          </div>
        }
      />

      <Panel className="overflow-hidden" hover={false}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Mapped MLX90640 Thermal Heatmap Visual Canvas */}
          <ThermalHeatmap />

          {/* Thermal Metrics Side Column */}
          <div className="border-t border-white/[0.08] bg-[#0d1424] p-6 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Thermal Palette Scale
            </p>
            <div className="mt-3 h-3 rounded-full bg-gradient-to-r from-blue-900 via-cyan-400 via-50% to-rose-600 shadow-inner" />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-400 font-semibold">
              <span>18°C</span>
              <span>31°C</span>
              <span>45°C</span>
            </div>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              MLX90640 Telemetry
            </p>
            <dl className="mt-4 space-y-4">
              {[
                ["Maximum", "42.8 °C", "text-amber-400"],
                ["Minimum", "22.1 °C", "text-blue-400"],
                ["Average", "29.6 °C", "text-slate-200"],
                ["Hotspot Index", "22, 14", "text-cyan-400"],
                ["Refresh Rate", "8.0 FPS", "text-emerald-400"],
              ].map(([key, val, valColor]) => (
                <div className="flex justify-between items-center border-b border-white/[0.05] pb-2.5" key={key}>
                  <dt className="text-xs font-medium text-slate-400">{key}</dt>
                  <dd className={`font-mono text-xs font-bold ${valColor}`}>{val}</dd>
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
    { label: "Max Hotspot Temp", val: `${sensorMetrics.hotspotTemp}°C`, delta: "+6.2%", isUp: true, colorClass: "text-amber-400", toneClass: "bg-amber-500/10 border-amber-500/20" },
    { label: "Power Consumption", val: "1.84 kWh", delta: "−2.4%", isUp: false, colorClass: "text-blue-400", toneClass: "bg-blue-500/10 border-blue-500/20" },
    { label: "Safety Alarm Events", val: "12", delta: "−18%", isUp: false, colorClass: "text-emerald-400", toneClass: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <>
      <PageHead
        title="Predictive Analytics & Load Charts"
        description="ACS712 current load curves and historical power profiles"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Panel className="p-6" key={c.label}>
            <p className="text-xs font-medium text-slate-400">{c.label}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white font-mono">{c.val}</p>
            <div className="mt-3">
              <TrendIndicator
                value={c.delta}
                label="vs. prior period"
                isUp={c.isUp}
                colorClass={c.colorClass}
                toneClass={c.toneClass}
              />
            </div>
          </Panel>
        ))}
      </div>

      {/* Mapped ACS712 Current Load Chart */}
      <div className="mt-6">
        <CurrentLoadChart />
      </div>

      {/* Power Consumption Profile */}
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
      title: "Current Exceeded Safety Threshold",
      text: "Line A peaked at 10.1A for 14 seconds. GPIO 18 Relay automatically engaged.",
      time: "09:42",
      badgeTone: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      iconTone: "bg-rose-500/20 text-rose-400",
    },
    {
      level: "Warning",
      title: "Thermal Rise Pattern Detected",
      text: "Distribution Panel 04 is trending 4.1°C above calculated ambient baseline.",
      time: "08:53",
      badgeTone: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      iconTone: "bg-amber-500/20 text-amber-400",
    },
    {
      level: "Info",
      title: "Automated Device Self-Inspection Complete",
      text: "Edge diagnostics confirmed all sensors (MLX90640, DHT11, ACS712) fully responsive.",
      time: "Yesterday",
      badgeTone: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      iconTone: "bg-blue-500/20 text-blue-400",
    },
  ];

  return (
    <>
      <PageHead
        title="Safety Alerts & Alarm Panel"
        description="GPIO 19 Buzzer acoustic triggers and relay trip logs"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {alertsList.map((alert) => (
            <AlertCard key={alert.title} {...alert} />
          ))}
        </div>

        <div>
          {/* Mapped Buzzer Alarm Panel */}
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

  return (
    <>
      <PageHead
        title="Telemetry & Event Logs"
        description="High-resolution time-series sensor output and trip history"
      />

      <Panel className="overflow-hidden" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                {["Timestamp", "Hotspot Temp", "Line Current", "Alarm Flag", "Relay State", "Status"].map((x) => (
                  <th className="px-6 py-4 font-semibold" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-mono">
              {rows.map((row, i) => (
                <tr className="transition hover:bg-white/[0.02]" key={i}>
                  <td className="px-6 py-4 text-slate-300 font-semibold">{row[0]}</td>
                  <td className="px-6 py-4 text-amber-400 font-bold">{row[1]}</td>
                  <td className="px-6 py-4 text-violet-400 font-bold">{row[2]}</td>
                  <td className="px-6 py-4 text-slate-300">{row[3]}</td>
                  <td className="px-6 py-4 text-slate-300">{row[4]}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        row[5] === "Critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : row[5] === "Warning"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
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
    { icon: Cpu, name: "ESP32 DevKit V1", status: "Online", detail: "192.168.1.48 · ESP-WROOM-32" },
    {
      icon: Thermometer,
      name: "DHT11 Environmental Sensor",
      status: sensorStatus.dht11Connected ? "Connected" : "Disconnected",
      detail: `${sensorMetrics.ambientTemp}°C · ${sensorMetrics.humidity}% RH · Pin 4`,
    },
    {
      icon: Activity,
      name: "MLX90640 Thermal Array",
      status: sensorStatus.mlx90640Connected ? "Connected" : "Disconnected",
      detail: `8 FPS · 32 × 24 Grid · Hotspot ${sensorMetrics.hotspotTemp}°C`,
    },
    {
      icon: Zap,
      name: "ACS712 Current Sensor",
      status: sensorStatus.acs712Connected ? "Connected" : "Disconnected",
      detail: `${sensorMetrics.lineCurrent}A Line Load · ADC Pin 34`,
    },
    {
      icon: Power,
      name: "Safety Relay Circuit",
      status: sensorStatus.relayConnected ? "Connected" : "Disconnected",
      detail: "Active Protection · Pin 18",
    },
  ];

  return (
    <>
      <PageHead
        title="Hardware Inventory"
        description="Edge node device registry and hardware pin mapping"
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
      toast.success("Settings Saved Successfully", {
        description: "Safety parameters synced to ESP32 Flash EEPROM.",
      });
    } catch (err) {
      toast.error("Failed to Sync Settings", {
        description: "Could not communicate with local ESP32 node.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHead
        title="Safety Settings"
        description="Configure edge thermal limits and automated trip triggers"
      />

      <Panel className="max-w-3xl p-6" hover={false}>
        <h3 className="text-base font-bold text-white">Protection Rule Thresholds</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Hardware parameters are synchronized directly with ESP32 flash EEPROM
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Temperature Threshold</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#0a0f1d] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={tempThresh}
                onChange={(e) => setTempThresh(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">°C</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Current Limit</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#0a0f1d] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={currLimit}
                onChange={(e) => setCurrLimit(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">A</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Alarm Delay</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#0a0f1d] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={alarmDel}
                onChange={(e) => setAlarmDel(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">seconds</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Relay Trip Delay</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#0a0f1d] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={relayDel}
                onChange={(e) => setRelayDel(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="text-xs font-semibold text-slate-500">seconds</span>
            </div>
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="mt-8 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
        >
          {saving ? "Syncing with ESP32..." : "Save Configurations"}
        </motion.button>
      </Panel>
    </>
  );
}

function About() {
  return (
    <>
      <PageHead
        title="About ThermoGuard"
        description="Real-time thermal intelligence for industrial fire prevention"
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Panel className="p-6" hover={false}>
          <h3 className="text-xl font-bold text-white">
            Stopping Electrical Fires Before Ignition.
          </h3>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            ThermoGuard combines high-resolution thermal imaging (MLX90640), ambient environmental sensing (DHT11), and high-frequency current monitoring (ACS712) with ESP32 edge processing to detect micro-hotspots in electrical infrastructure before they lead to fire hazards.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Hardware Array", "MLX90640 · DHT11 · ACS712"],
              ["Edge Platform", "ESP32 DevKit V1 (PlatformIO)"],
              ["Core Algorithm", "Real-time Thermal Anomaly Detection"],
            ].map(([a, b]) => (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4" key={a}>
                <p className="text-[11px] font-bold text-blue-400">{a}</p>
                <p className="mt-1 text-xs text-slate-300 font-medium">{b}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6" hover={false}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System Release
          </p>
          <p className="mt-2 font-mono text-3xl font-extrabold text-white">v2.4.1</p>
          <p className="mt-1 text-xs text-slate-400">Production Build</p>
          <Link
            to="/devices"
            className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            View hardware inventory <ChevronRight size={14} />
          </Link>
        </Panel>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md rounded-3xl border border-white/10 bg-[#0f172a]/90 p-8 text-center backdrop-blur-2xl shadow-2xl"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg">
          <Flame size={32} />
        </div>
        <p className="mt-6 font-mono text-6xl font-extrabold tracking-tight text-blue-400">
          404
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">Console Route Not Found</h2>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          The requested console path does not match any active telemetry page or device endpoint.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <Home size={16} /> Return to Operations Dashboard
          </Link>
          <Link
            to="/thermal-monitor"
            className="rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] transition"
          >
            Open Live Thermal Monitor →
          </Link>
        </div>
      </motion.div>
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
