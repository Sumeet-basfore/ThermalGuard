import React from "react";
import { motion } from "motion/react";

export interface GaugeMeterProps {
  value: number; // 0 to 100
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export function GaugeMeter({
  value,
  label,
  sublabel = "Optimal",
  color = "#22c55e",
  size = 140,
}: GaugeMeterProps) {
  const radius = 52;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // Half circle arc
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg
          viewBox="0 0 120 70"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 10,60 A 50,50 0 0,1 110,60"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Indicator Arc */}
          <motion.path
            d="M 10,60 A 50,50 0 0,1 110,60"
            fill="none"
            stroke="url(#gauge-grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center Display Value */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-mono text-2xl font-extrabold tracking-tight text-white">
            {value.toFixed(1)}%
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs font-bold text-slate-200">{label}</p>
      <span className="mt-0.5 text-[10px] font-semibold text-emerald-400">
        ● {sublabel}
      </span>
    </div>
  );
}
