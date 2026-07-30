import { useState } from "react";
import { createBrowserRouter, Link, Outlet, useLocation } from "react-router";
import {
  Activity, AlertTriangle, Check, ChevronRight, CircleHelp, Cpu, Database,
  Download, Droplets, Filter, Flame, Gauge, Home, LayoutDashboard, Power, RefreshCw,
  Settings, Thermometer, Zap, Wrench, ShieldAlert
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
      className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220]/90 backdrop-blur-md shadow-lg transition-all duration-200 ${className}`}
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
          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
          <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-400">
            Node #192.168.1.48 · Substation B
          </p>
        </div>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-medium md:text-sm">{description}</p>
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mx-5 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.08] px-1 pt-4 font-mono text-[11px] text-slate-500 lg:mx-8">
          <span>
            ESP32 Firmware <b className="font-semibold text-slate-300">v2.4.1</b>
          </span>
          <span className="text-slate-700">•</span>
          <span>PlatformIO Core 6.1.11</span>
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
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Telemetry Stream Operational
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
      status: sensorStatus.mlx90640Connected ? "Stable" : "Disconnected",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10 border-amber-400/20",
      stroke: "#f59e0b",
      fillGrad: "url(#grad-amber)",
      data: [22, 28, 25, 39, 34, 47, 42, 51, 46, 59, 53, sensorMetrics.hotspotTemp],
    },
    {
      icon: Thermometer,
      label: "DHT11 Ambient Temp",
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
      label: "DHT11 Relative Humidity",
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
      label: "ACS712 Line Current",
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
      {/* Clean Technical Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1120] p-6 lg:p-7 shadow-xl"
      >
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              SUBSTATION B PANEL 04 · INTERLOCK READY
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Thermal Degradation &amp; Overcurrent Monitor
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300 font-medium">
              Streaming 8.0 FPS spatial IR arrays (MLX90640) and 185mV/A current telemetry (ACS712) to detect micro-hotspots prior to insulation breakdown.
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-2xl border border-white/10 bg-black/40 p-4">
            <GaugeMeter value={99.4} label="Thermal Security" sublabel="PASS" color="#22c55e" size={125} />
          </div>
        </div>
      </motion.div>

      {/* Main Grid Content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <PageHead
            title="Telemetry Channel Grid"
            description="Continuous sensor output polled from ESP32 REST Gateway"
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
        title="MLX90640 Spatial Thermal Array"
        description="768-pixel sub-grid infrared array with automated peak coordinate isolation (I2C 0x33)"
        action={
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            8.0 FPS · {mode.toUpperCase()}
          </div>
        }
      />

      <Panel className="overflow-hidden" hover={false}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Mapped MLX90640 Thermal Heatmap Visual Canvas */}
          <ThermalHeatmap />

          {/* Thermal Metrics Side Column */}
          <div className="border-t border-white/[0.08] bg-[#0a101d] p-6 lg:border-l lg:border-t-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Thermal Calibration Scale
            </p>
            <div className="mt-3 h-3 rounded-full bg-gradient-to-r from-blue-900 via-cyan-400 via-50% to-rose-600 shadow-inner" />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-400 font-semibold">
              <span>18°C</span>
              <span>31°C</span>
              <span>45°C</span>
            </div>

            <p className="mt-8 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Array Telemetry (I2C 0x33)
            </p>
            <dl className="mt-4 space-y-4">
              {[
                ["Maximum Hotspot", "42.8 °C", "text-amber-400"],
                ["Minimum Ambient", "22.1 °C", "text-blue-400"],
                ["Mean Grid Temp", "29.6 °C", "text-slate-200"],
                ["Hotspot Index", "X: 22, Y: 14", "text-cyan-400"],
                ["Target Frame Rate", "8.0 FPS", "text-emerald-400"],
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
    { label: "Peak Thermal Delta", val: `${sensorMetrics.hotspotTemp}°C`, delta: "+6.2%", isUp: true, colorClass: "text-amber-400", toneClass: "bg-amber-500/10 border-amber-500/20" },
    { label: "Energy Consumption", val: "1.84 kWh", delta: "−2.4%", isUp: false, colorClass: "text-blue-400", toneClass: "bg-blue-500/10 border-blue-500/20" },
    { label: "Safety Trip Events", val: "0 Active", delta: "Nominal", isUp: false, colorClass: "text-emerald-400", toneClass: "bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <>
      <PageHead
        title="Power & Load Analytics"
        description="ACS712 high-frequency current wave logs and 24-hour load profiles"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Panel className="p-6" key={c.label}>
            <p className="text-xs font-semibold text-slate-400">{c.label}</p>
            <p className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-white">{c.val}</p>
            <div className="mt-3">
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
      title: "Current Overload Threshold Trip",
      text: "ACS712 (ADC 34) registered 10.1A peak on Line A for 14s. GPIO 18 Relay disengaged load line.",
      time: "09:42:18",
      badgeTone: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      iconTone: "bg-rose-500/20 text-rose-400",
    },
    {
      level: "Warning",
      title: "Elevated Hotspot Delta Warning",
      text: "MLX90640 registered 4.1°C thermal rise over ambient baseline on Busbar 04.",
      time: "08:53:02",
      badgeTone: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      iconTone: "bg-amber-500/20 text-amber-400",
    },
    {
      level: "Info",
      title: "Self-Diagnostic Routine Passed",
      text: "ESP32 self-test verified communication on I2C (0x33 MLX90640), GPIO 4 (DHT11), and GPIO 18 (Relay).",
      time: "Yesterday",
      badgeTone: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      iconTone: "bg-blue-500/20 text-blue-400",
    },
  ];

  return (
    <>
      <PageHead
        title="Safety Alerts & Relay Incidents"
        description="Log of automated trip triggers and acoustic warnings (GPIO 19)"
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

  const handleExportCSV = () => {
    toast.success("CSV Export Initiated", {
      description: "Downloading telemetry_event_log_2026.csv...",
    });
  };

  return (
    <>
      <PageHead
        title="Raw Sensor & Event Telemetry Logs"
        description="High-resolution time-series data logged from ESP32 edge memory"
        action={
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition"
          >
            <Download size={14} /> Export Telemetry CSV
          </motion.button>
        }
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
        description: "Safety rules written to ESP32 Flash EEPROM.",
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
        description="Hardware interlock parameters synced to ESP32 Flash memory"
      />

      <Panel className="max-w-3xl p-6" hover={false}>
        <h3 className="text-base font-bold text-white">ESP32 Hardware Trip Parameters</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Threshold settings are written directly to ESP32 non-volatile EEPROM storage
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Hotspot Trip Temperature</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#080d1a] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={tempThresh}
                onChange={(e) => setTempThresh(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="font-mono text-xs font-semibold text-slate-500">°C</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Overcurrent Limit (ACS712)</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#080d1a] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={currLimit}
                onChange={(e) => setCurrLimit(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="font-mono text-xs font-semibold text-slate-500">A</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Buzzer Alarm Delay</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#080d1a] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={alarmDel}
                onChange={(e) => setAlarmDel(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="font-mono text-xs font-semibold text-slate-500">seconds</span>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-300">Relay Disconnect Delay</span>
            <div className="mt-2 flex rounded-xl border border-white/10 bg-[#080d1a] px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
              <input
                value={relayDel}
                onChange={(e) => setRelayDel(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
              />
              <span className="font-mono text-xs font-semibold text-slate-500">seconds</span>
            </div>
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="mt-8 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition disabled:opacity-50"
        >
          {saving ? "Writing to EEPROM..." : "Write to ESP32 Flash"}
        </motion.button>
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
        <Panel className="p-6" hover={false}>
          <h3 className="text-xl font-extrabold text-white">
            Electrical Thermal Degradation Monitoring
          </h3>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            ThermalGuard integrates 32×24 spatial thermal imaging (MLX90640), ambient environmental sensing (DHT11), and high-frequency current monitoring (ACS712) into a unified ESP32 edge node to isolate micro-hotspots prior to electrical insulation breakdown.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["IR Sensor Array", "MLX90640 (I2C 0x33, 768px)"],
              ["Edge Processor", "ESP32 DevKit V1 (240MHz)"],
              ["Current Sensor", "ACS712 (185mV/A Calibration)"],
            ].map(([a, b]) => (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4" key={a}>
                <p className="font-mono text-[11px] font-bold text-blue-400">{a}</p>
                <p className="mt-1 text-xs text-slate-300 font-medium">{b}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6" hover={false}>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Firmware Version
          </p>
          <p className="mt-2 font-mono text-3xl font-extrabold text-white">v2.4.1</p>
          <p className="mt-1 text-xs text-slate-400 font-mono">PlatformIO Core 6.1.11</p>
          <Link
            to="/devices"
            className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md rounded-3xl border border-white/10 bg-[#0a101d] p-8 text-center shadow-2xl"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-md">
          <ShieldAlert size={32} />
        </div>
        <p className="mt-6 font-mono text-5xl font-extrabold tracking-tight text-slate-200">
          404
        </p>
        <h2 className="mt-2 text-lg font-bold text-white">Unknown Route Path</h2>
        <p className="mt-2 text-xs text-slate-400 font-medium leading-relaxed">
          The requested path does not map to any active telemetry channel or hardware configuration view.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition"
          >
            <Home size={16} /> Return to Operations Dashboard
          </Link>
          <Link
            to="/thermal-monitor"
            className="rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] transition"
          >
            Open MLX90640 Thermal Grid →
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
