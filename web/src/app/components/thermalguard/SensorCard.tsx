import React from "react";
import { LucideIcon, WifiOff } from "lucide-react";
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
  icon: Icon,
  label,
  value,
  unit,
  status,
  color,
  stroke,
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
    <div
      className={`rounded-lg border p-4 transition-colors duration-150 overflow-hidden ${
        isDisconnected
          ? "border-[#ffb4ab]/40 bg-[#111318]"
          : "border-[#434655] bg-[#111318] hover:border-[#b4c5ff]/50"
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-[#c3c6d7]">
            {isDisconnected ? <WifiOff size={18} className="text-[#ffb4ab]" /> : <Icon size={18} className={color} />}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#c3c6d7]">{label}</span>
        </div>

        {/* Status Indicator */}
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {isDisconnected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#ffb4ab]" />
              <span className="text-[#ffb4ab]">Disconnected</span>
            </>
          ) : status === "Warning" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#d03e1b]" />
              <span className="text-[#d03e1b]">Warning</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
              <span className="text-[#b4c5ff]">Normal</span>
            </>
          )}
        </span>
      </div>

      {/* Main Metric Output */}
      <div className="mt-3 flex items-baseline justify-between">
        {isDisconnected ? (
          <p className="font-['JetBrains_Mono'] text-sm text-[#ffb4ab]">
            Disconnected
          </p>
        ) : (
          <div>
            <span className="font-['JetBrains_Mono'] text-32px font-bold tracking-tight text-[#e2e2e9]">
              {isValidNumber ? <AnimatedNumber value={numericValue} decimals={1} /> : "--.--"}
            </span>
            <span className="ml-2 font-['JetBrains_Mono'] text-sm text-[#c3c6d7]">{unit}</span>
          </div>
        )}
      </div>

      {/* Minimal Sparkline Chart (Clean 1.5px non-scaling stroke) */}
      {!isDisconnected && data && data.length > 0 && (
        <div className="mt-3 h-8 w-full overflow-hidden">
          <svg className="h-full w-full overflow-hidden" viewBox="0 0 120 30" preserveAspectRatio="none">
            <path
              d="M 0 24 L 10 20 L 20 22 L 30 15 L 40 18 L 50 10 L 60 12 L 70 8 L 80 14 L 90 6 L 100 10 L 110 4 L 120 4"
              fill="none"
              stroke={stroke || "#2563eb"}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
