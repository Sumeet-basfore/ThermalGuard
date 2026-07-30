import React from "react";
import { Cpu } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

export function DeviceHealthWidget() {
  const { systemHealth } = useTelemetry();

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#2A3140] pb-3">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-[#2563EB]" />
          <h3 className="text-sm font-bold text-[#F8FAFC]">ESP32 Node Diagnostics</h3>
        </div>
        <span className="font-mono text-xs text-[#16A34A] font-semibold">● Healthy</span>
      </div>

      <div className="mt-4 space-y-3 font-mono text-xs">
        <div>
          <div className="flex justify-between text-[#94A3B8]">
            <span>CPU Load</span>
            <span className="text-[#F8FAFC] font-semibold">{systemHealth.cpuLoad}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded bg-[#0B0D12]">
            <div className="h-full rounded bg-[#2563EB]" style={{ width: `${systemHealth.cpuLoad}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#94A3B8]">
            <span>RAM Usage</span>
            <span className="text-[#F8FAFC] font-semibold">{systemHealth.memoryUsage}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded bg-[#0B0D12]">
            <div className="h-full rounded bg-[#16A34A]" style={{ width: `${systemHealth.memoryUsage}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#94A3B8]">
            <span>WiFi Signal (RSSI)</span>
            <span className="text-[#16A34A] font-semibold">{systemHealth.wifiSignal}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded bg-[#0B0D12]">
            <div className="h-full rounded bg-[#16A34A]" style={{ width: `${systemHealth.wifiSignal}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
