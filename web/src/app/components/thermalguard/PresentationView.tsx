import React from "react";
import { Check, Flame, Minimize2, ShieldCheck, Thermometer, Zap, Droplets, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useTelemetry } from "../../context/TelemetryContext";
import { AnimatedNumber } from "./AnimatedNumber";
import { GaugeMeter } from "./GaugeMeter";
import { ThermalHeatmap } from "./ThermalHeatmap";

export interface PresentationViewProps {
  onExit: () => void;
}

export function PresentationView({ onExit }: PresentationViewProps) {
  const { sensorMetrics, mode, lastSyncTime } = useTelemetry();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#040711] bg-grid-pattern p-6 lg:p-10 font-[Inter] text-slate-100 selection:bg-blue-500/30"
    >
      {/* Top Presentation Bar */}
      <header className="mx-auto flex max-w-[1700px] items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-[0_0_35px_rgba(59,130,246,0.6)] border border-blue-400/40">
            <ShieldCheck size={32} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#040711] bg-emerald-400 shadow-[0_0_10px_#22c55e]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide text-white lg:text-4xl">
              THERMOGUARD <span className="text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full">Projector Presentation Mode</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400 font-medium">
              Real-time Industrial Thermal Intelligence & Fire Safety Monitoring
            </p>
          </div>
        </div>

        {/* Live Feed Status & Exit Action */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-5 py-2 text-xs font-extrabold text-emerald-300 sm:flex shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#22c55e]" />
            </span>
            LIVE DEMO FEED · {mode.toUpperCase()} MODE
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-extrabold text-white backdrop-blur-md hover:bg-white/20 transition shadow-xl"
          >
            <Minimize2 size={18} /> Exit Presentation (Esc)
          </motion.button>
        </div>
      </header>

      {/* Main Focus Canvas */}
      <main className="mx-auto mt-8 max-w-[1700px] space-y-8">
        {/* Prominent Hero System Safety Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0a1727] to-[#0a1424] p-8 lg:p-10 shadow-2xl shadow-emerald-500/10">
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-4 py-1.5 text-xs font-extrabold text-emerald-300 shadow-md">
                <Check size={18} /> ALL ELECTRICAL PANELS OPERATIONAL &amp; SAFE
              </div>
              <h2 className="text-4xl font-extrabold text-white lg:text-5xl tracking-tight leading-tight">
                Zero Thermal Anomaly Detected
              </h2>
              <p className="mt-3 text-base text-slate-200 leading-relaxed font-medium">
                High-frequency MLX90640 spatial thermal imaging paired with ACS712 load monitoring continuously protects high-voltage distribution units from thermal runaways.
              </p>
            </div>

            {/* High-Visibility Security Index Arc Gauge */}
            <div className="flex items-center gap-6 rounded-3xl border border-white/15 bg-black/50 p-6 backdrop-blur-xl shadow-2xl">
              <GaugeMeter value={99.4} label="Security Index" sublabel="OPTIMAL" color="#22c55e" size={170} />
            </div>
          </div>
        </div>

        {/* Scaled-up High-Impact Sensor Telemetry Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 shadow-xl border border-amber-400/30">
                <Flame size={30} />
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                ● Normal
              </span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Hotspot Temperature</p>
            <div className="mt-2 font-mono text-5xl font-extrabold text-white">
              <AnimatedNumber value={sensorMetrics.hotspotTemp} decimals={1} /> <span className="text-xl text-amber-400 font-normal">°C</span>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-500/40 bg-blue-500/10 p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/20 text-blue-400 shadow-xl border border-blue-400/30">
                <Thermometer size={30} />
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                ● Normal
              </span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Ambient Temperature</p>
            <div className="mt-2 font-mono text-5xl font-extrabold text-white">
              <AnimatedNumber value={sensorMetrics.ambientTemp} decimals={1} /> <span className="text-xl text-blue-400 font-normal">°C</span>
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/40 bg-cyan-500/10 p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-400 shadow-xl border border-cyan-400/30">
                <Droplets size={30} />
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                ● Optimal
              </span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Relative Humidity</p>
            <div className="mt-2 font-mono text-5xl font-extrabold text-white">
              <AnimatedNumber value={sensorMetrics.humidity} decimals={0} /> <span className="text-xl text-cyan-400 font-normal">% RH</span>
            </div>
          </div>

          <div className="rounded-3xl border border-violet-500/40 bg-violet-500/10 p-8 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/20 text-violet-400 shadow-xl border border-violet-400/30">
                <Zap size={30} />
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                ● Normal
              </span>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">Line Current Load</p>
            <div className="mt-2 font-mono text-5xl font-extrabold text-white">
              <AnimatedNumber value={sensorMetrics.lineCurrent} decimals={1} /> <span className="text-xl text-violet-400 font-normal">A</span>
            </div>
          </div>
        </div>

        {/* Large-Format High-Readability Projector Visualizer Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Spatial Thermal Camera Heatmap */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-white">Live Thermal Infrared Array</h3>
              <span className="font-mono text-xs text-slate-400">Sync: {lastSyncTime}</span>
            </div>
            <ThermalHeatmap />
          </div>

          {/* High-Readability Temperature History Curve Chart */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-white">Thermal Trend Analysis</h3>
            <div className="rounded-2xl border border-white/10 bg-[#0c1322] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <Activity className="text-blue-400" size={24} />
                  <span className="text-sm font-bold text-white">24-Hour Hotspot vs. Ambient (°C)</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-3 w-3 rounded-full bg-amber-400" /> Hotspot
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="h-3 w-3 rounded-full bg-blue-400" /> Ambient
                  </span>
                </div>
              </div>

              <div className="relative mt-6 h-72 w-full">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                  {/* Hotspot Trend Curve */}
                  <path
                    d="M 0 120 Q 100 110, 200 60 T 400 80 T 500 45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4"
                  />
                  {/* Ambient Trend Curve */}
                  <path
                    d="M 0 140 Q 100 135, 200 120 T 400 125 T 500 110"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
