import React from "react";
import { Link } from "react-router";

export function EventTimeline() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Active Safety Alerts</h3>
        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
          2 Active
        </span>
      </div>
      <div className="mt-5 space-y-4 border-l-2 border-white/10 pl-4">
        <div className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-[#0f172a]" />
          <p className="text-xs font-bold text-slate-200">Current Threshold Reached</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Line A peaked at 10.1A · 09:42</p>
        </div>
        <div className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-[#0f172a]" />
          <p className="text-xs font-bold text-slate-200">Relay Safety Triggered</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Auto-restored in 2.1s · 08:16</p>
        </div>
      </div>
      <Link
        to="/alerts"
        className="mt-6 block text-center text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
      >
        View all alert logs →
      </Link>
    </div>
  );
}
