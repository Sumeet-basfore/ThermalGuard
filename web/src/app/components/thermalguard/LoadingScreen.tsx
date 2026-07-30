import React from "react";
import { Shield } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0D12] font-[Inter] text-[#F8FAFC]">
      <div className="flex flex-col items-center">
        <div className="grid h-12 w-12 place-items-center rounded bg-[#2563EB] text-white">
          <Shield size={24} />
        </div>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-[#F8FAFC]">
          ThermalGuard
        </h1>
        <p className="mt-1 font-mono text-xs text-[#64748B]">
          INDUSTRIAL THERMAL INTELLIGENCE
        </p>

        <div className="mt-6 h-1 w-40 overflow-hidden rounded bg-[#151922]">
          <div className="h-full w-1/2 bg-[#2563EB] animate-pulse" />
        </div>

        <p className="mt-3 font-mono text-xs text-[#64748B]">
          Connecting to ESP32 Gateway...
        </p>
      </div>
    </div>
  );
}
