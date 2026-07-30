import React from "react";
import { Zap } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { AnimatedNumber } from "../thermalguard/AnimatedNumber";

export function CurrentLoadChart() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-md">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ACS712 Line Current Monitor</h3>
            <p className="text-xs text-slate-400 font-mono">ESP32 ADC Pin 34 · 0.185 V/A Sensitivity Calibration</p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
            sensorStatus.acs712Connected
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
          }`}
        >
          ● {sensorStatus.acs712Connected ? "ACS712 ACTIVE" : "DISCONNECTED"}
        </span>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">Current Measured Line Load</p>
          <div className="mt-1 font-mono text-4xl font-extrabold text-white">
            <AnimatedNumber value={sensorMetrics.lineCurrent} decimals={1} /> <span className="text-lg font-normal text-slate-400">Amperes (A)</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-slate-400">Safe Trip Threshold</p>
          <p className="mt-1 font-mono text-sm font-bold text-rose-400">10.0 A Limit</p>
        </div>
      </div>

      {/* Real-time Load Curve Visualizer */}
      <div className="relative mt-6 h-36 w-full rounded-xl border border-white/10 bg-[#0a0f1d] p-4">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="current-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 10A Threshold Safety Reference Line */}
          <line x1="0" y1="20" x2="500" y2="20" stroke="#f43f5e" strokeDasharray="4 4" strokeWidth="1.5" />

          {/* Load Curve Polyline */}
          <path
            d="M 0 70 Q 100 65, 200 45 T 400 55 T 500 35 L 500 100 L 0 100 Z"
            fill="url(#current-grad)"
          />
          <path
            d="M 0 70 Q 100 65, 200 45 T 400 55 T 500 35"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
        </svg>

        <span className="absolute right-4 top-2 font-mono text-[9px] text-rose-400 font-bold">
          OVERLOAD THRESHOLD 10.0A
        </span>
      </div>
    </div>
  );
}
