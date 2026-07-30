import React from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface AlertCardProps {
  level: string;
  title: string;
  text: string;
  time: string;
  badgeTone?: string;
  iconTone?: string;
}

export function AlertCard({ level, title, text, time }: AlertCardProps) {
  const isCritical = level === "Critical";
  const isWarning = level === "Warning";

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition-colors ${
        isCritical
          ? "border-[#DC2626]/40 bg-[#151922]"
          : isWarning
          ? "border-[#D97706]/40 bg-[#151922]"
          : "border-[#2A3140] bg-[#151922]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {isCritical ? (
              <AlertCircle size={18} className="text-[#DC2626]" />
            ) : isWarning ? (
              <AlertTriangle size={18} className="text-[#D97706]" />
            ) : (
              <Info size={18} className="text-[#2563EB]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                  isCritical
                    ? "bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30"
                    : isWarning
                    ? "bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/30"
                    : "bg-[#2563EB]/20 text-[#2563EB] border border-[#2563EB]/30"
                }`}
              >
                {level.toUpperCase()}
              </span>
              <h4 className="text-sm font-bold text-[#F8FAFC]">{title}</h4>
            </div>
            <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed">{text}</p>
          </div>
        </div>

        <span className="font-mono text-xs text-[#64748B] whitespace-nowrap">{time}</span>
      </div>
    </div>
  );
}
