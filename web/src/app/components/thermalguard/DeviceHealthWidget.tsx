import React from "react";
import { ProgressRing } from "./ProgressRing";

export function DeviceHealthWidget() {
  const metrics = [
    { label: "ESP32 CPU Load", val: 32, color: "#60a5fa" },
    { label: "RAM Memory", val: 48, color: "#a78bfa" },
    { label: "WiFi Signal", val: 88, color: "#34d399" },
    { label: "Storage Flash", val: 22, color: "#fbbf24" },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <h3 className="text-base font-bold text-white">System Health</h3>
      <p className="mt-0.5 text-xs text-slate-400">Microcontroller & Radio status</p>
      <div className="mt-5 space-y-4">
        {metrics.map((m) => (
          <ProgressRing
            key={m.label}
            label={m.label}
            value={m.val}
            color={m.color}
            size={48}
          />
        ))}
      </div>
    </div>
  );
}
