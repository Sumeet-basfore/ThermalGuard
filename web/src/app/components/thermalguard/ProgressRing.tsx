import React from "react";
import { motion } from "motion/react";

export interface ProgressRingProps {
  value: number; // 0 - 100
  label: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  value,
  label,
  color = "#60a5fa",
  size = 48,
  strokeWidth = 4,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative grid place-items-center" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90 overflow-visible">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute font-mono text-[10px] font-bold text-white">
          {value}%
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-200">{label}</p>
        <p className="text-[10px] text-emerald-400 font-medium">● Healthy</p>
      </div>
    </div>
  );
}
