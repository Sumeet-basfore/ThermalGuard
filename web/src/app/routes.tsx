import { useState } from "react";
import { createBrowserRouter, Link, Outlet, useLocation } from "react-router";
import { toast } from "sonner";

import { useTelemetry } from "./context/TelemetryContext";
import { ApiService } from "./services/api";
import { SidebarNav } from "./components/thermalguard/SidebarNav";
import { TopHeader } from "./components/thermalguard/TopHeader";
import { ThermalHeatmap } from "./components/thermalguard/ThermalHeatmap";
import { buildPolylinePoints } from "./services/chartUtils";

const nav = [
  ["/", "dashboard", "Dashboard"],
  ["/thermal-monitor", "thermostat", "Thermal Monitor"],
  ["/analytics", "analytics", "Analytics"],
  ["/alerts", "notifications_active", "Alerts"],
  ["/logs", "description", "Logs"],
  ["/devices", "developer_board", "Devices"],
] as const;

const secondaryNav = [
  ["/settings", "settings", "Settings"],
  ["/about", "info", "About"],
] as const;

function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { mode } = useTelemetry();
  const page =
    [...nav, ...secondaryNav].find(([path]) => path === location.pathname)?.[2] ??
    "Dashboard";

  return (
    <div className="min-h-screen bg-[#111318] font-[Inter] text-[#e2e2e9] flex flex-col">
      <SidebarNav
        navItems={nav}
        secondaryNavItems={secondaryNav}
        open={open}
        setOpen={setOpen}
      />

      <main className="lg:ml-[240px] flex-1 flex flex-col min-h-screen bg-[#111318] overflow-x-hidden">
        <TopHeader pageName={page} onOpenMobileMenu={() => setOpen(true)} />

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </div>

        <footer className="min-h-8 py-1.5 sm:py-0 bg-[#0c0e13] border-t border-[#434655] flex flex-wrap items-center justify-between px-3 sm:px-6 font-['JetBrains_Mono'] text-[9px] sm:text-[10px] text-[#c3c6d7] uppercase gap-2">
          <div className="flex gap-3 sm:gap-6 items-center flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b4c5ff]"></span>
              <span>MTBF: 12,400 hrs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b4c5ff]"></span>
              <span>Firmware: v2.4.1-STABLE</span>
            </div>
          </div>
          <div>
            LATENCY: 14ms | MODE: {mode.toUpperCase()}
          </div>
        </footer>
      </main>
    </div>
  );
}

/* =========================================================================
   1. DASHBOARD VIEW (operations_dashboard/code.html)
   ========================================================================= */
function Dashboard() {
  const { sensorMetrics, mode, tempHistory } = useTelemetry();
  const [relayAuto, setRelayAuto] = useState(true);
  const [relayActive, setRelayActive] = useState(true);
  const [buzzerMuted, setBuzzerMuted] = useState(false);

  const playWebAudioBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      [0, 0.22, 0.44].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.7, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.18);
      });
    } catch (e) {}
  };

  const handleTestBuzzer = async () => {
    playWebAudioBeep();
    if (mode === "live") {
      toast.info("Buzzer Test Triggered (GPIO 19)", {
        description: "Pulsing GPIO 19 acoustic alarm on ESP32...",
      });
      const ok = await ApiService.triggerBuzzerTest();
      if (ok) {
        toast.success("ESP32 GPIO 19 Hardware Beep Verified!", {
          description: "Physical buzzer pulse confirmed by gateway.",
        });
      } else {
        toast.warning("Hardware Gateway Unreachable", {
          description: "Physical ESP32 node did not respond.",
        });
      }
    } else {
      toast.success("Demo Alarm Sounded 🔔", {
        description: "Web speaker alert tone played. Switch to Live Mode for physical GPIO 19 pulse.",
      });
    }
  };

  const handleToggleRelayMode = () => {
    setRelayAuto(!relayAuto);
    toast.success(`Relay Control Set to ${!relayAuto ? "AUTO" : "MANUAL"}`, {
      description: "GPIO 18 Interlock logic updated.",
    });
  };

  const handleToggleRelayState = () => {
    setRelayActive(!relayActive);
    toast.warning(`Relay State: ${!relayActive ? "ACTIVE (CLOSED)" : "TRIPPED (OPEN)"}`, {
      description: "GPIO 18 output toggled.",
    });
  };

  return (
    <div className="grid grid-cols-12 gap-4 content-start">
      {/* Top Row: Security Index & Sensor Metrics */}
      <div className="col-span-12 lg:col-span-4 bg-[#111318] border border-[#434655] p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="flex justify-between items-start z-10">
          <div>
            <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
              System Security Index
            </p>
            <p className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#b4c5ff] mt-1">
              99.4% <span className="text-[18px] font-normal text-[#e2e2e9]">Pass</span>
            </p>
          </div>
          <span className="material-symbols-outlined text-[#b4c5ff] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
        </div>

        <div className="mt-4 z-10">
          <div className="w-full bg-[#33353a] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#b4c5ff] h-full" style={{ width: "99.4%" }}></div>
          </div>
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] mt-2 text-[#c3c6d7]">
            Protocol Integrity: Verified
          </p>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Hotspot Max */}
        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
            HOTSPOT MAX
          </p>
          <p className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9] mt-2">
            {sensorMetrics.hotspotTemp}
            <span className="text-[14px] ml-1 font-normal text-[#c3c6d7]">°C</span>
          </p>
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#ffb4ab] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> +2.1%
          </p>
        </div>

        {/* Metric 2: Ambient Temp */}
        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
            AMBIENT TEMP
          </p>
          <p className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9] mt-2">
            {sensorMetrics.ambientTemp}
            <span className="text-[14px] ml-1 font-normal text-[#c3c6d7]">°C</span>
          </p>
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#b4c5ff] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">image_arrow_up</span> NOMINAL
          </p>
        </div>

        {/* Metric 3: Line Current */}
        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
            LINE CURRENT
          </p>
          <p className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9] mt-2">
            {sensorMetrics.lineCurrent}
            <span className="text-[14px] ml-1 font-normal text-[#c3c6d7]">A</span>
          </p>
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] mt-2">
            PIN: GPIO 34
          </p>
        </div>

        {/* Metric 4: Humidity */}
        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
            HUMIDITY
          </p>
          <p className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9] mt-2">
            {sensorMetrics.humidity}
            <span className="text-[14px] ml-1 font-normal text-[#c3c6d7]">%</span>
          </p>
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] mt-2">
            DHT11 Sensor
          </p>
        </div>
      </div>

      {/* Middle Row: Temperature History Chart & Environmental / Relay Panels */}
      <div className="col-span-12 lg:col-span-9 bg-[#111318] border border-[#434655] flex flex-col h-[260px] sm:h-[320px] lg:h-[380px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#434655] flex justify-between items-center">
          <h3 className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#e2e2e9]">
            Live Temperature History (Primary Bus)
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#2563eb]"></span>
            <span className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
              Node_01_Hotspot
            </span>
          </div>
        </div>
        <div className="flex-1 p-4 relative bg-[#0c0e13] overflow-hidden">
          <svg className="w-full h-full overflow-hidden" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <polyline
              points={buildPolylinePoints(tempHistory, 1000, 300, 30, 30)}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#2563eb", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#2563eb", stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          </svg>

          {/* Marker Tooltip */}
          <div className="absolute right-6 top-4 flex flex-col items-end pointer-events-none">
            <div className="bg-[#33353a]/90 border border-[#434655] px-3 py-1.5 rounded text-[11px] font-['JetBrains_Mono'] text-[#e2e2e9] backdrop-blur-sm shadow-md">
              HOTSPOT: <span className="text-[#b4c5ff] font-bold">{sensorMetrics.hotspotTemp}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: DHT11 & Relay Panel */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        {/* DHT11 Environmental */}
        <div className="bg-[#111318] border border-[#434655] p-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
              DHT11 Environmental
            </p>
            <div className="flex items-end gap-2 mt-2">
              <span className="font-['JetBrains_Mono'] text-[24px] font-bold text-[#e2e2e9]">
                {sensorMetrics.ambientTemp}°C
              </span>
              <span className="font-['JetBrains_Mono'] text-[24px] text-[#c3c6d7] opacity-40">/</span>
              <span className="font-['JetBrains_Mono'] text-[24px] font-bold text-[#e2e2e9]">
                {sensorMetrics.humidity}% RH
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-[#434655] pt-3">
            <div className="flex justify-between font-[Inter] text-[11px] text-[#c3c6d7]">
              <span>Dew Point</span>
              <span className="text-[#e2e2e9] font-mono">11.2°C</span>
            </div>
            <div className="flex justify-between font-[Inter] text-[11px] text-[#c3c6d7]">
              <span>Heat Index</span>
              <span className="text-[#e2e2e9] font-mono">25.1°C</span>
            </div>
          </div>
        </div>

        {/* Relay Control Panel */}
        <div className="bg-[#111318] border border-[#434655] p-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
                GPIO 18 Relay
              </p>
              <h4 className="font-[Inter] text-[18px] font-bold text-[#e2e2e9]">Aux Cooling</h4>
            </div>
            <button onClick={handleToggleRelayState} title="Toggle Relay Interlock Output">
              <span
                className={`material-symbols-outlined cursor-pointer ${
                  relayActive ? "text-[#2563eb]" : "text-[#ffb4ab]"
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                power_settings_new
              </span>
            </button>
          </div>

          <div className="mt-3 flex bg-[#1a1b21] p-1 rounded border border-[#434655]">
            <button
              onClick={handleToggleRelayMode}
              className={`flex-1 text-center py-1 font-[Inter] text-[11px] font-bold rounded ${
                relayAuto ? "bg-[#2563eb] text-[#eeefff]" : "text-[#c3c6d7]"
              }`}
            >
              AUTO
            </button>
            <button
              onClick={handleToggleRelayMode}
              className={`flex-1 text-center py-1 font-[Inter] text-[11px] font-bold rounded ${
                !relayAuto ? "bg-[#2563eb] text-[#eeefff]" : "text-[#c3c6d7]"
              }`}
            >
              MANUAL
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">Status:</span>
            <span className={`px-2 py-0.5 font-[Inter] text-[11px] font-bold rounded ${
              relayActive ? "bg-[#2563eb]/10 text-[#b4c5ff]" : "bg-[#ffb4ab]/10 text-[#ffb4ab]"
            }`}>
              {relayActive ? "ACTIVE" : "TRIPPED"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Buzzer, Health, Event Timeline */}
      <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#111318] border border-[#434655] p-4 flex flex-col justify-between">
        <div>
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] mb-3">
            GPIO 19 Buzzer Alarm
          </p>
          <button
            onClick={handleTestBuzzer}
            className="w-full py-2 bg-[#33353a] border border-[#434655] font-[Inter] text-[11px] font-bold text-[#e2e2e9] hover:bg-[#434655] transition-all rounded"
          >
            TEST ALERT SYSTEM
          </button>

          <div className="mt-3 flex items-center justify-between p-3 bg-[#1a1b21] rounded border border-[#434655]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c6d7]">
                {buzzerMuted ? "notifications_off" : "notifications_active"}
              </span>
              <span className="font-[Inter] text-[14px]">Mute Audio</span>
            </div>
            <button
              onClick={() => setBuzzerMuted(!buzzerMuted)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                buzzerMuted ? "bg-[#2563eb]" : "bg-[#33353a]"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  buzzerMuted ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#434655] flex justify-between items-center text-[10px] font-['JetBrains_Mono'] uppercase">
          <span className="text-[#c3c6d7]">Current State:</span>
          <span className="text-[#b4c5ff] animate-pulse">Monitoring</span>
        </div>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#111318] border border-[#434655] p-4 flex flex-col gap-3">
        <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7]">
          Device Health
        </p>

        <div className="space-y-3 font-['JetBrains_Mono'] text-[12px]">
          <div>
            <div className="flex justify-between mb-1 text-[#c3c6d7]">
              <span>CPU Usage</span>
              <span className="text-[#e2e2e9]">14%</span>
            </div>
            <div className="w-full h-1.5 bg-[#33353a] rounded-full">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "14%" }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-[#c3c6d7]">
              <span>SRAM (Free)</span>
              <span className="text-[#e2e2e9]">184KB</span>
            </div>
            <div className="w-full h-1.5 bg-[#33353a] rounded-full">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 text-[#c3c6d7]">
              <span>WiFi Signal (RSSI)</span>
              <span className="text-[#e2e2e9]">-58 dBm</span>
            </div>
            <div className="w-full h-1.5 bg-[#33353a] rounded-full">
              <div className="bg-[#2563eb] h-full rounded-full" style={{ width: "82%" }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6 bg-[#111318] border border-[#434655] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#434655] flex justify-between items-center">
          <h3 className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#e2e2e9]">
            Recent Event Timeline
          </h3>
          <span className="material-symbols-outlined text-sm text-[#c3c6d7] cursor-pointer">refresh</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-[Inter] text-[13px]">
            <thead className="bg-[#1a1b21] font-[Inter] text-[10px] font-bold text-[#c3c6d7] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 border-b border-[#434655] whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-2 border-b border-[#434655] whitespace-nowrap">Source</th>
                <th className="px-4 py-2 border-b border-[#434655]">Event</th>
                <th className="px-4 py-2 border-b border-[#434655] text-right whitespace-nowrap">Severity</th>
              </tr>
            </thead>
            <tbody className="font-['JetBrains_Mono'] text-[12px] divide-y divide-[#434655]">
              <tr className="hover:bg-[#1e1f25] transition-colors">
                <td className="px-4 py-2 whitespace-nowrap">14:52:01</td>
                <td className="px-4 py-2 text-[#b4c5ff] whitespace-nowrap">GPIO_18</td>
                <td className="px-4 py-2 text-[#e2e2e9]">State change: HIGH (Auto)</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <span className="px-1.5 py-0.5 bg-[#33353a] rounded text-[10px] text-[#e2e2e9]">INFO</span>
                </td>
              </tr>
              <tr className="hover:bg-[#1e1f25] transition-colors">
                <td className="px-4 py-2 whitespace-nowrap">14:48:14</td>
                <td className="px-4 py-2 text-[#ecf0ff] whitespace-nowrap">SYS_CORE</td>
                <td className="px-4 py-2 text-[#e2e2e9]">Watchdog timer reset</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <span className="px-1.5 py-0.5 bg-[#33353a] rounded text-[10px] text-[#e2e2e9]">DEBUG</span>
                </td>
              </tr>
              <tr className="hover:bg-[#1e1f25] transition-colors">
                <td className="px-4 py-2 whitespace-nowrap">14:45:00</td>
                <td className="px-4 py-2 text-[#ffb4ab] whitespace-nowrap">THRM_SENS</td>
                <td className="px-4 py-2 text-[#ffb4ab]">Threshold breach &gt; 72.0°C</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <span className="px-1.5 py-0.5 bg-[#93000a] text-[#ffdad6] rounded text-[10px]">CRITICAL</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. THERMAL MONITOR VIEW (thermal_monitor/code.html)
   ========================================================================= */
function ThermalMonitor() {
  return (
    <div className="space-y-6">
      <ThermalHeatmap />
    </div>
  );
}

/* =========================================================================
   3. ANALYTICS VIEW (analytics_load_curve/code.html)
   ========================================================================= */
function Analytics() {
  const { sensorMetrics, currentHistory } = useTelemetry();

  return (
    <div className="space-y-6">
      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] uppercase mb-1">
            Peak Current Load
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9]">
              {sensorMetrics.lineCurrent}
            </span>
            <span className="font-[Inter] text-[18px] text-[#c3c6d7]">A</span>
          </div>
          <p className="font-[Inter] text-[13px] text-[#ffb4ab] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">error</span> Threshold Limit: 10.0A
          </p>
        </div>

        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] uppercase mb-1">
            Hotspot Temp Delta
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9]">
              {(sensorMetrics.hotspotTemp - sensorMetrics.ambientTemp).toFixed(1)}
            </span>
            <span className="font-[Inter] text-[18px] text-[#c3c6d7]">°C</span>
          </div>
          <p className="font-[Inter] text-[13px] text-[#b4c5ff] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> Elevated Baseline
          </p>
        </div>

        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] uppercase mb-1">
            Avg System Efficiency
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-['JetBrains_Mono'] text-[32px] font-bold text-[#e2e2e9]">94.8</span>
            <span className="font-[Inter] text-[18px] text-[#c3c6d7]">%</span>
          </div>
          <p className="font-[Inter] text-[13px] text-[#c3c6d7] mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">horizontal_rule</span> Stable Baseline
          </p>
        </div>

        <div className="bg-[#111318] border border-[#434655] p-4">
          <p className="font-[Inter] text-[11px] font-bold tracking-[0.05em] text-[#c3c6d7] uppercase mb-1">
            Calibration Specs
          </p>
          <div className="space-y-1 font-['JetBrains_Mono'] text-[12px] mt-2">
            <div className="flex justify-between">
              <span className="text-[#c3c6d7]">ADC Pin:</span>
              <span className="text-[#e2e2e9]">GPIO 34</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c3c6d7]">Sensitivity:</span>
              <span className="text-[#e2e2e9]">185 mV/A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111318] border border-[#434655] p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-[Inter] text-[18px] font-semibold text-[#e2e2e9] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#b4c5ff] rounded-full"></span>
              ACS712 Current Load Curve
            </h3>
            <div className="flex gap-2">
              <button className="bg-[#282a2f] border border-[#434655] px-3 py-1 font-[Inter] text-[11px] font-bold text-[#b4c5ff] rounded">
                LIVE
              </button>
            </div>
          </div>

          <div className="relative h-[240px] sm:h-[300px] lg:h-[360px] w-full bg-[#0c0e13] border border-[#434655] overflow-hidden rounded">
            <svg className="w-full h-full overflow-hidden" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <line x1="0" x2="1000" y1="60" y2="60" stroke="#ffb4ab" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <polyline
                points={buildPolylinePoints(currentHistory, 1000, 300, 0, 12)}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="absolute left-4 top-[50px] font-['JetBrains_Mono'] text-[10px] text-[#ffb4ab] font-bold">
              10.0A [OVERLOAD LIMIT]
            </div>
          </div>
        </div>

        <div className="bg-[#111318] border border-[#434655] p-6 flex flex-col justify-between">
          <h3 className="font-[Inter] text-[18px] font-semibold text-[#e2e2e9] mb-4">
            Energy Profile (kWh)
          </h3>
          <div className="space-y-4 font-[Inter] text-[14px]">
            <div className="flex justify-between items-center border-b border-[#434655] pb-2">
              <span className="text-[#c3c6d7]">Total Consumption</span>
              <span className="font-['JetBrains_Mono'] text-[#e2e2e9] font-bold">42.85 kWh</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#434655] pb-2">
              <span className="text-[#c3c6d7]">Estimated Cost</span>
              <span className="font-['JetBrains_Mono'] text-[#e2e2e9] font-bold">$14.12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#c3c6d7]">Carbon Footprint</span>
              <span className="font-['JetBrains_Mono'] text-[#4ade80] font-bold">8.2 kg CO2e</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. ALERTS VIEW (alerts_incident_feed/code.html)
   ========================================================================= */
function Alerts() {
  const { mode } = useTelemetry();
  const [incidents, setIncidents] = useState([
    { id: 1, time: "2024-05-24 14:22:01.04", source: "MLX90640", desc: "Threshold Breach > 72.0C", level: "CRITICAL", ack: false },
    { id: 2, time: "2024-05-24 14:21:45.82", source: "ACS712", desc: "Relay Interlock Trip - Overcurrent", level: "WARNING", ack: false },
    { id: 3, time: "2024-05-24 14:19:12.11", source: "SYS_CORE", desc: "ADC Channel 34 Impedance Out of Range", level: "WARNING", ack: true },
  ]);

  const playWebAudioBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      [0, 0.22, 0.44].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.7, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.18);
      });
    } catch (e) {}
  };

  const handleTestBuzzer = async () => {
    playWebAudioBeep();
    if (mode === "live") {
      toast.info("Buzzer Test Triggered (GPIO 19)", {
        description: "Pulsing GPIO 19 acoustic alarm on ESP32...",
      });
      const ok = await ApiService.triggerBuzzerTest();
      if (ok) {
        toast.success("ESP32 GPIO 19 Hardware Beep Verified!", {
          description: "Physical buzzer pulse confirmed by gateway.",
        });
      } else {
        toast.warning("Hardware Gateway Unreachable", {
          description: "Physical ESP32 node did not respond.",
        });
      }
    } else {
      toast.success("Demo Alarm Sounded 🔔", {
        description: "Web speaker alert tone played. Switch to Live Mode for physical GPIO 19 pulse.",
      });
    }
  };

  const handleAck = (id: number) => {
    setIncidents(incidents.map((i) => (i.id === id ? { ...i, ack: true } : i)));
    toast.success("Incident Acknowledged", { description: `Alert #${id} marked as reviewed.` });
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 space-y-4">
        <div className="bg-[#111318] border border-[#434655] p-3 flex items-center justify-between">
          <h3 className="font-[Inter] text-[18px] font-bold text-[#e2e2e9]">Incident Log Feed</h3>
          <span className="font-['JetBrains_Mono'] text-[12px] text-[#b4c5ff]">
            {incidents.filter((i) => !i.ack).length} Active Alerts
          </span>
        </div>

        <div className="space-y-2">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-[#111318] border border-[#434655] p-4 flex items-center justify-between rounded">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 font-[Inter] text-[10px] font-bold rounded ${
                    inc.level === "CRITICAL" ? "bg-[#93000a] text-[#ffdad6]" : "bg-[#33353a] text-[#b4c5ff]"
                  }`}>
                    {inc.level}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[12px] text-[#c3c6d7]">{inc.source}</span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#c3c6d7]">{inc.time}</span>
                </div>
                <p className="mt-1 font-[Inter] text-[14px] font-semibold text-[#e2e2e9]">{inc.desc}</p>
              </div>

              {!inc.ack ? (
                <button
                  onClick={() => handleAck(inc.id)}
                  className="px-3 py-1 bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#b4c5ff] font-[Inter] text-[11px] font-bold rounded hover:bg-[#2563eb] hover:text-[#eeefff] transition-all"
                >
                  ACK
                </button>
              ) : (
                <span className="font-[Inter] text-[11px] font-bold text-[#c3c6d7]">ACKNOWLEDGED</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 bg-[#111318] border border-[#434655] p-6 rounded">
        <h3 className="font-[Inter] text-[11px] font-bold uppercase tracking-wider text-[#c3c6d7] mb-4">
          GPIO 19: Buzzer Hardware Map
        </h3>
        <button
          onClick={handleTestBuzzer}
          className="w-full bg-[#2563eb] text-[#eeefff] py-3 rounded font-[Inter] text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">campaign</span> Test Alarm System
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   5. LOGS VIEW (system_sensor_logs/code.html)
   ========================================================================= */
function Logs() {
  const { sensorMetrics } = useTelemetry();

  const handleExportCSV = () => {
    toast.success("CSV Export Complete", {
      description: "Downloaded telemetry_sensor_log_2026.csv",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#111318] border border-[#434655] p-4 rounded">
        <div>
          <h3 className="font-[Inter] text-[18px] font-bold text-[#e2e2e9]">System Telemetry Logs</h3>
          <p className="font-[Inter] text-[13px] text-[#c3c6d7]">Raw time-series telemetry recorded by ESP32</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[#2563eb] text-[#eeefff] font-[Inter] text-[11px] font-bold rounded hover:brightness-110 transition-all"
        >
          Export CSV Log
        </button>
      </div>

      <div className="bg-[#111318] border border-[#434655] overflow-x-auto rounded">
        <table className="w-full text-left font-['JetBrains_Mono'] text-[12px]">
          <thead className="bg-[#1a1b21] border-b border-[#434655] text-[#c3c6d7] text-[10px] uppercase">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">MLX90640 (°C)</th>
              <th className="p-3">ACS712 (A)</th>
              <th className="p-3">DHT11 Temp</th>
              <th className="p-3">DHT11 Humidity</th>
              <th className="p-3">Relay State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#434655]">
            <tr className="hover:bg-[#1e1f25]">
              <td className="p-3 text-[#e2e2e9]">{sensorMetrics.timestamp}</td>
              <td className="p-3 text-[#ffb4ab] font-bold">{sensorMetrics.hotspotTemp}°C</td>
              <td className="p-3 text-[#b4c5ff] font-bold">{sensorMetrics.lineCurrent}A</td>
              <td className="p-3 text-[#e2e2e9]">{sensorMetrics.ambientTemp}°C</td>
              <td className="p-3 text-[#e2e2e9]">{sensorMetrics.humidity}%</td>
              <td className="p-3 text-[#b4c5ff]">CLOSED (OK)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   6. DEVICES VIEW (device_registry/code.html)
   ========================================================================= */
function Devices() {
  const { sensorStatus } = useTelemetry();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#111318] border border-[#434655] p-5 rounded">
        <div className="flex items-center justify-between">
          <h4 className="font-[Inter] text-[16px] font-bold text-[#e2e2e9]">ESP32 DevKit V1 Gateway</h4>
          <span className="px-2 py-0.5 bg-[#2563eb]/10 text-[#b4c5ff] font-[Inter] text-[11px] font-bold rounded">ONLINE</span>
        </div>
        <p className="font-['JetBrains_Mono'] text-[12px] text-[#c3c6d7] mt-2">IP: 192.168.1.48 · Xtensa Dual-Core 240MHz</p>
      </div>

      <div className="bg-[#111318] border border-[#434655] p-5 rounded">
        <div className="flex items-center justify-between">
          <h4 className="font-[Inter] text-[16px] font-bold text-[#e2e2e9]">MLX90640 Spatial IR Array</h4>
          <span className={`px-2 py-0.5 font-[Inter] text-[11px] font-bold rounded ${
            sensorStatus.mlx90640Connected ? "bg-[#2563eb]/10 text-[#b4c5ff]" : "bg-[#93000a] text-[#ffdad6]"
          }`}>
            {sensorStatus.mlx90640Connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
        <p className="font-['JetBrains_Mono'] text-[12px] text-[#c3c6d7] mt-2">I2C Address: 0x33 · 32×24 Spatial Grid</p>
      </div>
    </div>
  );
}

/* =========================================================================
   7. SETTINGS VIEW (system_settings_thresholds/code.html)
   ========================================================================= */
function SettingsPage() {
  const [tempThresh, setTempThresh] = useState("45");
  const [currLimit, setCurrLimit] = useState("10");

  const handleSave = async () => {
    try {
      await ApiService.saveSettings({
        tempThreshold: parseFloat(tempThresh),
        currentLimit: parseFloat(currLimit),
        alarmDelay: 5,
        relayTripDelay: 2,
      });
      toast.success("EEPROM Parameters Saved", {
        description: "Written safety threshold rules to ESP32 Flash memory.",
      });
    } catch {
      toast.error("Save Failed", { description: "Could not write to ESP32 EEPROM." });
    }
  };

  return (
    <div className="bg-[#111318] border border-[#434655] p-6 max-w-xl rounded">
      <h3 className="font-[Inter] text-[18px] font-bold text-[#e2e2e9]">Hardware Trip Thresholds</h3>
      <div className="mt-4 space-y-4 font-[Inter] text-[14px]">
        <label className="block">
          <span className="text-[#c3c6d7] text-[12px]">Hotspot Trip Temp (°C)</span>
          <input
            value={tempThresh}
            onChange={(e) => setTempThresh(e.target.value)}
            className="w-full mt-1 bg-[#1a1b21] border border-[#434655] p-2 text-[#e2e2e9] font-['JetBrains_Mono'] rounded"
          />
        </label>
        <label className="block">
          <span className="text-[#c3c6d7] text-[12px]">Overcurrent Limit (A)</span>
          <input
            value={currLimit}
            onChange={(e) => setCurrLimit(e.target.value)}
            className="w-full mt-1 bg-[#1a1b21] border border-[#434655] p-2 text-[#e2e2e9] font-['JetBrains_Mono'] rounded"
          />
        </label>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#2563eb] text-[#eeefff] font-bold text-[12px] rounded hover:brightness-110 transition-all"
        >
          Save to ESP32 EEPROM
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   8. ABOUT VIEW (about_thermalguard/code.html)
   ========================================================================= */
function About() {
  return (
    <div className="bg-[#111318] border border-[#434655] p-6 rounded max-w-3xl">
      <h3 className="font-[Inter] text-[24px] font-bold text-[#e2e2e9]">ThermalGuard System Specification</h3>
      <p className="mt-2 text-[14px] text-[#c3c6d7] leading-relaxed">
        ThermalGuard integrates 32×24 spatial thermal imaging (MLX90640), ambient environmental sensing (DHT11), and high-frequency current monitoring (ACS712) into a unified ESP32 edge node to isolate micro-hotspots prior to electrical insulation breakdown.
      </p>
    </div>
  );
}

/* =========================================================================
   9. NOT FOUND 404 VIEW
   ========================================================================= */
function NotFound() {
  return (
    <div className="p-8 text-center bg-[#111318] border border-[#434655] rounded max-w-md mx-auto">
      <h2 className="text-[32px] font-bold font-['JetBrains_Mono'] text-[#ffb4ab]">404</h2>
      <p className="text-[#c3c6d7] mt-2">Route not found</p>
      <Link to="/" className="mt-4 inline-block px-4 py-2 bg-[#2563eb] text-white rounded font-bold text-xs">
        Return to Dashboard
      </Link>
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
