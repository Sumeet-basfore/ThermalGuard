import React from "react";
import { Droplets, Thermometer } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { AnimatedNumber } from "../thermalguard/AnimatedNumber";

export function EnvironmentalCard() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-[#06b6d4]">
            <Thermometer size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">DHT11 Environmental Sensor</h3>
            <p className="font-mono text-xs text-[#64748B]">GPIO 4 · Ambient Temp &amp; Relative Humidity</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {sensorStatus.dht11Connected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#16A34A]">Connected</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-[#DC2626]">Disconnected</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-[#2A3140] bg-[#0B0D12] p-4">
          <p className="text-xs font-medium text-[#94A3B8]">Ambient Temperature</p>
          <div className="mt-1 font-mono text-22px font-bold text-[#F8FAFC]">
            <AnimatedNumber value={sensorMetrics.ambientTemp} decimals={1} /> °C
          </div>
          <p className="mt-1 font-mono text-[11px] text-[#16A34A]">● Operating within nominal range</p>
        </div>

        <div className="rounded border border-[#2A3140] bg-[#0B0D12] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#94A3B8]">Relative Humidity</p>
            <Droplets size={16} className="text-[#06b6d4]" />
          </div>
          <div className="mt-1 font-mono text-22px font-bold text-[#F8FAFC]">
            <AnimatedNumber value={sensorMetrics.humidity} decimals={0} /> % RH
          </div>
          <p className="mt-1 font-mono text-[11px] text-[#06b6d4]">● Environmental moisture nominal</p>
        </div>
      </div>
    </div>
  );
}
