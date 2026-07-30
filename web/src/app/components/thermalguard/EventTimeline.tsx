import React from "react";
import { Activity } from "lucide-react";

export function EventTimeline() {
  const events = [
    { time: "09:42:18", label: "Relay trip interlock test executed", status: "OK" },
    { time: "08:53:02", label: "DHT11 climate reading updated", status: "OK" },
    { time: "08:00:00", label: "ESP32 REST Gateway boot complete", status: "OK" },
  ];

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#2A3140] pb-3">
        <Activity size={18} className="text-[#2563EB]" />
        <h3 className="text-sm font-bold text-[#F8FAFC]">Recent Event Log</h3>
      </div>

      <div className="mt-4 space-y-3 font-mono text-xs">
        {events.map((e, idx) => (
          <div className="flex items-center justify-between border-b border-[#2A3140]/40 pb-2" key={idx}>
            <div>
              <p className="text-[#F8FAFC] font-sans font-medium text-xs">{e.label}</p>
              <p className="text-[#64748B] text-[11px]">{e.time}</p>
            </div>
            <span className="text-[#16A34A] font-bold text-[10px]">{e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
