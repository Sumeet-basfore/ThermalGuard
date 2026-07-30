import React from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export function TemperatureChart() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Temperature Telemetry History</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Hotspot vs. Ambient temperature over the past 12 hours
          </p>
        </div>
        <Link
          to="/analytics"
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
        >
          Detailed analytics <ChevronRight size={14} />
        </Link>
      </div>

      {/* SVG Chart Area */}
      <div className="relative mt-6 h-[220px] w-full">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 900 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chart-area-hotspot-tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chart-area-ambient-tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[30, 75, 120, 165].map((y, i) => (
            <line
              key={i}
              x1="0"
              y1={y}
              x2="900"
              y2={y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Ambient curve */}
          <path
            d="M0 144 C65 142 90 135 126 139 S210 121 245 130 S323 115 376 121 S448 105 504 116 S580 98 635 108 S710 91 758 100 S845 80 900 88"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Hotspot curve area */}
          <path
            d="M0 138 C65 125 70 115 126 120 S190 90 245 103 S323 68 376 84 S448 55 504 75 S580 45 635 63 S710 28 758 51 S845 34 900 17 L900 180 L0 180 Z"
            fill="url(#chart-area-hotspot-tg)"
          />

          {/* Hotspot curve line */}
          <path
            d="M0 138 C65 125 70 115 126 120 S190 90 245 103 S323 68 376 84 S448 55 504 75 S580 45 635 63 S710 28 758 51 S845 34 900 17"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span>MLX90640 Hotspot (°C)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <span>DHT11 Ambient (°C)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
