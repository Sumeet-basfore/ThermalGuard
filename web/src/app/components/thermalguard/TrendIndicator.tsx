import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface TrendIndicatorProps {
  value: string;
  label: string;
  isUp?: boolean;
  colorClass?: string;
  toneClass?: string;
}

export function TrendIndicator({
  value,
  label,
  isUp = true,
  colorClass = "text-emerald-400",
  toneClass = "bg-emerald-500/10 border-emerald-500/20",
}: TrendIndicatorProps) {
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${toneClass}`}>
      <Icon size={14} className={colorClass} />
      <span className={colorClass}>{value}</span>
      <span className="text-slate-400 font-normal">{label}</span>
    </div>
  );
}
