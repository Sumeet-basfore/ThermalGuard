import React from "react";
import { Check, Flame, Minimize2, Shield, Thermometer, Zap, Droplets, Activity } from "lucide-react";
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0D12] p-8 font-[Inter] text-[#F8FAFC]">
      {/* Presentation Bar */}
      <header className="mx-auto flex max-w-[1600px] items-center justify-between border-b border-[#2A3140] pb-6">
        <div className="flex items-center gap-3">
          <img
            src="/Logo.jpeg"
            alt="ThermalGuard Logo"
            className="w-10 h-10 rounded-lg object-cover border border-[#434655]"
          />
          <div>
            <h1 className="text-22px font-bold text-[#F8FAFC]">
              ThermalGuard — Executive Presentation Mode
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Substation Electrical Monitoring &amp; Thermal Anomaly Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 rounded border border-[#16A34A]/40 bg-[#16A34A]/10 px-3 py-1 font-mono text-xs font-semibold text-[#16A34A]">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> LIVE DEMO · {mode.toUpperCase()} MODE
          </span>

          <button
            onClick={onExit}
            className="flex items-center gap-2 rounded border border-[#2A3140] bg-[#151922] px-4 py-2 text-xs font-semibold text-[#F8FAFC] hover:bg-[#2A3140] transition-colors"
          >
            <Minimize2 size={16} /> Exit Presentation (Esc)
          </button>
        </div>
      </header>

      {/* Main Focus Canvas */}
      <main className="mx-auto mt-8 max-w-[1600px] space-y-8">
        {/* System Safety Summary Card */}
        <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded border border-[#16A34A]/40 bg-[#16A34A]/10 px-3 py-1 font-mono text-xs font-semibold text-[#16A34A]">
                <Check size={16} /> SYSTEM STATUS NORMAL
              </div>
              <h2 className="text-32px font-bold tracking-tight text-[#F8FAFC]">
                Zero Thermal Anomaly Detected
              </h2>
              <p className="mt-2 text-sm text-[#94A3B8] max-w-2xl">
                Continuous MLX90640 spatial thermal imaging and ACS712 line current monitoring active on Substation Panel 04.
              </p>
            </div>

            <div className="rounded-lg border border-[#2A3140] bg-[#0B0D12] p-4">
              <GaugeMeter value={99.4} label="Security Index" sublabel="PASS" color="#16A34A" size={140} />
            </div>
          </div>
        </div>

        {/* Scaled Metric Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-6">
            <div className="flex items-center justify-between">
              <div className="text-[#D97706]">
                <Flame size={20} />
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> Normal
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">Hotspot Temperature</p>
            <div className="mt-1 font-mono text-32px font-bold text-[#F8FAFC]">
              <AnimatedNumber value={sensorMetrics.hotspotTemp} decimals={1} /> °C
            </div>
          </div>

          <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-6">
            <div className="flex items-center justify-between">
              <div className="text-[#2563EB]">
                <Thermometer size={20} />
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> Normal
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">Ambient Temperature</p>
            <div className="mt-1 font-mono text-32px font-bold text-[#F8FAFC]">
              <AnimatedNumber value={sensorMetrics.ambientTemp} decimals={1} /> °C
            </div>
          </div>

          <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-6">
            <div className="flex items-center justify-between">
              <div className="text-[#06b6d4]">
                <Droplets size={20} />
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> Optimal
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">Relative Humidity</p>
            <div className="mt-1 font-mono text-32px font-bold text-[#F8FAFC]">
              <AnimatedNumber value={sensorMetrics.humidity} decimals={0} /> % RH
            </div>
          </div>

          <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-6">
            <div className="flex items-center justify-between">
              <div className="text-[#8b5cf6]">
                <Zap size={20} />
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> Normal
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#64748B]">Line Current Load</p>
            <div className="mt-1 font-mono text-32px font-bold text-[#F8FAFC]">
              <AnimatedNumber value={sensorMetrics.lineCurrent} decimals={1} /> A
            </div>
          </div>
        </div>

        {/* Visualizers Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-22px font-bold text-[#F8FAFC]">MLX90640 Spatial Array</h3>
              <span className="font-mono text-xs text-[#94A3B8]">Sync: {lastSyncTime}</span>
            </div>
            <ThermalHeatmap />
          </div>

          <div className="space-y-3">
            <h3 className="text-22px font-bold text-[#F8FAFC]">Thermal Trend History</h3>
            <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-6">
              <div className="flex items-center justify-between border-b border-[#2A3140] pb-4">
                <span className="text-sm font-semibold text-[#F8FAFC]">24-Hour Hotspot vs. Ambient (°C)</span>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-[#D97706]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" /> Hotspot
                  </span>
                  <span className="flex items-center gap-1.5 text-[#2563EB]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> Ambient
                  </span>
                </div>
              </div>

              <div className="relative mt-6 h-64 w-full">
                <svg className="h-full w-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#2A3140" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#2A3140" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#2A3140" strokeDasharray="3 3" />

                  <path
                    d="M 0 120 Q 100 110, 200 60 T 400 80 T 500 45"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 0 140 Q 100 135, 200 120 T 400 125 T 500 110"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
