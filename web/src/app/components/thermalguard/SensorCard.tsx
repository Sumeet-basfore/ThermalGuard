import React from "react";
import { LucideIcon, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "./AnimatedNumber";

export interface SensorCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  status: string;
  color: string;
  bgColor: string;
  stroke: string;
  fillGrad: string;
  data: number[];
}

export function SensorCard({
  id,
  icon: Icon,
  label,
  value,
  unit,
  status,
  color,
  bgColor,
  stroke,
  fillGrad,
  data,
}: SensorCardProps) {
  const isDisconnected =
    status === "Disconnected" ||
    value === "NaN" ||
    value === "undefined" ||
    value === null;

  const numericValue = typeof value === "number" ? value : parseFloat(String(value));
  const isValidNumber = !isNaN(numericValue);

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.2)" }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 ${
        isDisconnected
          ? "border-rose-500/30 bg-rose-950/10 shadow-lg shadow-rose-950/20"
          : "border-white/[0.08] bg-[#0f172a]/75 shadow-xl shadow-black/30"
      }`}
    >
      {/* Sparkline background gradient definitions */}
      <svg className="absolute hidden">
        <defs>
          <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-cyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-violet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl border ${
              isDisconnected ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : bgColor
            } shadow-md`}
          >
            {isDisconnected ? <WifiOff size={20} /> : <Icon size={20} className={color} />}
          </div>
          <span className="text-xs font-semibold text-slate-300">{label}</span>
        </div>

        {/* Status Badge */}
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide transition ${
            isDisconnected
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_10px_#f43f5e] animate-pulse"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          }`}
        >
          ● {isDisconnected ? "Disconnected" : status}
        </span>
      </div>

      {/* Main Metric Output Row */}
      <div className="mt-4 flex items-baseline justify-between">
        {isDisconnected ? (
          <div className="space-y-1">
            <p className="font-mono text-lg font-bold text-rose-400 animate-pulse">
              Waiting for device...
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Reconnecting to ESP32 sensor bus...
            </p>
          </div>
        ) : (
          <div>
            <span className="font-mono text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {isValidNumber ? <AnimatedNumber value={numericValue} decimals={1} /> : "--.--"}
            </span>
            <span className="ml-2 font-mono text-sm font-bold text-slate-400">{unit}</span>
          </div>
        )}
      </div>

      {/* Micro Sparkline Chart (Hidden when disconnected) */}
      {!isDisconnected && (
        <div className="relative mt-4 h-10 w-full overflow-hidden rounded-lg bg-black/20 p-1">
          <svg className="h-full w-full" viewBox="0 0 120 30" preserveAspectRatio="none">
            <path
              d={`M 0 25 L 10 20 L 20 22 L 30 15 L 40 18 L 50 10 L 60 12 L 70 8 L 80 14 L 90 6 L 100 10 L 110 4 L 120 4 L 120 30 L 0 30 Z`}
              fill={fillGrad}
            />
            <path
              d={`M 0 25 L 10 20 L 20 22 L 30 15 L 40 18 L 50 10 L 60 12 L 70 8 L 80 14 L 90 6 L 100 10 L 110 4 L 120 4`}
              fill="none"
              stroke={stroke}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
