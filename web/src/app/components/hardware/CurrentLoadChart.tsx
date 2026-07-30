import React from "react";
import { Zap } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { AnimatedNumber } from "../thermalguard/AnimatedNumber";

export function CurrentLoadChart() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  return (
    <div className="rounded-lg border border-[#434655] bg-[#111318] p-5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#434655] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="text-[#b4c5ff]">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#e2e2e9]">ACS712 Line Current Monitor</h3>
            <p className="font-['JetBrains_Mono'] text-xs text-[#c3c6d7]">ADC Pin 34 · 185 mV/A Calibration</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-semibold">
          {sensorStatus.acs712Connected ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
              <span className="text-[#b4c5ff]">Active</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#ffb4ab]" />
              <span className="text-[#ffb4ab]">Disconnected</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-[#c3c6d7]">Measured Line Load</p>
          <div className="mt-1 font-['JetBrains_Mono'] text-32px font-bold text-[#e2e2e9]">
            <AnimatedNumber value={sensorMetrics.lineCurrent} decimals={1} /> <span className="text-sm font-normal text-[#c3c6d7]">Amperes (A)</span>
          </div>
        </div>

        <div className="text-right font-['JetBrains_Mono'] text-xs">
          <p className="text-[#c3c6d7]">Safety Interlock Limit</p>
          <p className="mt-0.5 font-bold text-[#ffb4ab]">10.0 A Max</p>
        </div>
      </div>

      {/* Real-time Load Curve */}
      <div className="relative mt-4 h-32 w-full rounded border border-[#434655] bg-[#0c0e13] p-3 overflow-hidden">
        <svg className="h-full w-full overflow-hidden" viewBox="0 0 500 100" preserveAspectRatio="none">
          <line x1="0" y1="20" x2="500" y2="20" stroke="#ffb4ab" strokeDasharray="3 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path
            d="M 0 70 Q 100 65, 200 45 T 400 55 T 500 35"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span className="absolute right-3 top-2 font-['JetBrains_Mono'] text-[10px] text-[#ffb4ab] font-semibold">
          TRIP THRESHOLD 10.0A
        </span>
      </div>
    </div>
  );
}
