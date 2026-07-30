import React from "react";

export function PowerChart() {
  const bars = [30, 44, 38, 52, 58, 44, 67, 61, 76, 54, 82, 68];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <h3 className="text-base font-bold text-white">Power Consumption Profile</h3>
      <p className="mt-0.5 text-xs text-slate-400">
        Hourly load metrics (kWh) over the current operational cycle
      </p>

      <div className="mt-8 grid h-64 grid-cols-12 items-end gap-3 rounded-xl border border-white/[0.05] bg-[#0a0f1d] p-4">
        {bars.map((h, i) => (
          <div className="group relative flex h-full flex-col justify-end items-center" key={i}>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-300 shadow-md"
              style={{ height: `${h}%` }}
            />
            <span className="mt-2 font-mono text-[10px] text-slate-500 font-semibold">{i * 2}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}
