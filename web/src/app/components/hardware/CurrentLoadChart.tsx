import React from "react";
import { Zap } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { AnimatedNumber } from "../thermalguard/AnimatedNumber";

export function CurrentLoadChart() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#2A3140] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="text-[#8b5cf6]">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">ACS712 Line Current Monitor</h3>
            <p className="font-mono text-xs text-[#64748B]">ADC Pin 34 · 185 mV/A Calibration</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold">
          {sensorStatus.acs712Connected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#16A34A]">Active</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-[#DC2626]">Disconnected</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-[#94A3B8]">Measured Line Load</p>
          <div className="mt-1 font-mono text-32px font-bold text-[#F8FAFC]">
            <AnimatedNumber value={sensorMetrics.lineCurrent} decimals={1} /> <span className="text-sm font-normal text-[#64748B]">Amperes (A)</span>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <p className="text-[#64748B]">Safety Interlock Limit</p>
          <p className="mt-0.5 font-bold text-[#DC2626]">10.0 A Max</p>
        </div>
      </div>

      {/* Real-time Load Curve */}
      <div className="relative mt-4 h-32 w-full rounded border border-[#2A3140] bg-[#0B0D12] p-3">
        <svg className="h-full w-full" viewBox="0 0 500 100" preserveAspectRatio="none">
          <line x1="0" y1="20" x2="500" y2="20" stroke="#DC2626" strokeDasharray="3 3" strokeWidth="1.5" />
          <path
            d="M 0 70 Q 100 65, 200 45 T 400 55 T 500 35"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
        </svg>

        <span className="absolute right-3 top-2 font-mono text-[10px] text-[#DC2626] font-semibold">
          TRIP THRESHOLD 10.0A
        </span>
      </div>
    </div>
  );
}
