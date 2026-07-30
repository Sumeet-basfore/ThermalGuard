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
      className={`rounded-lg border p-5 transition-colors duration-150 ${
        isDisconnected
          ? "border-[#DC2626]/40 bg-[#151922]"
          : "border-[#2A3140] bg-[#151922] hover:border-[#64748B]/50"
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-[#94A3B8]">
            {isDisconnected ? <WifiOff size={18} className="text-[#DC2626]" /> : <Icon size={18} className={color} />}
          </div>
          <span className="text-sm font-medium text-[#94A3B8]">{label}</span>
        </div>

        {/* Status Indicator */}
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {isDisconnected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-[#DC2626]">Disconnected</span>
            </>
          ) : status === "Warning" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#D97706]" />
              <span className="text-[#D97706]">Warning</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#16A34A]">Normal</span>
            </>
          )}
        </span>
      </div>

      {/* Main Metric Output */}
      <div className="mt-4 flex items-baseline justify-between">
        {isDisconnected ? (
          <p className="font-mono text-sm text-[#DC2626]">
            Disconnected
          </p>
        ) : (
          <div>
            <span className="font-mono text-32px font-bold tracking-tight text-[#F8FAFC]">
              {isValidNumber ? <AnimatedNumber value={numericValue} decimals={1} /> : "--.--"}
            </span>
            <span className="ml-2 font-mono text-sm text-[#64748B]">{unit}</span>
          </div>
        )}
      </div>

      {/* Minimal Sparkline Chart (Clean 1.5px line, no neon glow) */}
      {!isDisconnected && data && data.length > 0 && (
        <div className="mt-3 h-8 w-full">
          <svg className="h-full w-full" viewBox="0 0 120 30" preserveAspectRatio="none">
            <path
              d="M 0 24 L 10 20 L 20 22 L 30 15 L 40 18 L 50 10 L 60 12 L 70 8 L 80 14 L 90 6 L 100 10 L 110 4 L 120 4"
              fill="none"
              stroke={stroke || "#2563EB"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
