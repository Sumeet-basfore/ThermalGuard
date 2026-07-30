import React from "react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111318] font-[Inter] text-[#e2e2e9]">
      <div className="flex flex-col items-center">
        <img
          src="/Logo.jpeg"
          alt="ThermalGuard Logo"
          className="w-16 h-16 rounded-xl object-cover border border-[#434655] shadow-lg"
        />

        <h1 className="mt-4 text-xl font-bold tracking-tight text-[#e2e2e9]">
          ThermalGuard
        </h1>
        <p className="mt-1 font-['JetBrains_Mono'] text-xs text-[#c3c6d7]">
          INDUSTRIAL THERMAL INTELLIGENCE
        </p>

        <div className="mt-6 h-1 w-40 overflow-hidden rounded bg-[#1e1f25]">
          <div className="h-full w-1/2 bg-[#2563eb] animate-pulse" />
        </div>

        <p className="mt-3 font-['JetBrains_Mono'] text-xs text-[#c3c6d7]">
          Connecting to ESP32 Gateway...
        </p>
      </div>
    </div>
  );
}
