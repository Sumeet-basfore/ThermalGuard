import React, { useState } from "react";
import { Flame, WifiOff } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";

export function ThermalHeatmap() {
  const { thermalFrame, sensorStatus } = useTelemetry();
  const [selectedPalette, setSelectedPalette] = useState<"ironbow" | "rainbow" | "fire">("ironbow");
  const isDisconnected = !sensorStatus.mlx90640Connected;

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-6 shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2A3140] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="text-[#D97706]">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">MLX90640 Thermal Grid (32×24)</h3>
            <p className="font-mono text-xs text-[#94A3B8]">I2C Bus 0x33 · 768 Sub-Pixels</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            {isDisconnected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                <span className="text-[#DC2626]">Disconnected</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-[#16A34A]">Active Feed</span>
              </>
            )}
          </span>

          <div className="flex rounded border border-[#2A3140] bg-[#0B0D12] p-0.5 font-mono text-xs">
            {(["ironbow", "rainbow", "fire"] as const).map((palette) => (
              <button
                key={palette}
                onClick={() => setSelectedPalette(palette)}
                className={`rounded px-2.5 py-0.5 font-semibold transition-colors ${
                  selectedPalette === palette
                    ? "bg-[#2563EB] text-[#F8FAFC]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]"
                }`}
              >
                {palette}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Canvas */}
      <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded border border-[#2A3140] bg-[#0B0D12]">
        {isDisconnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded border border-[#DC2626]/40 bg-[#DC2626]/10 text-[#DC2626]">
              <WifiOff size={24} />
            </div>
            <h4 className="mt-3 font-mono text-sm font-bold text-[#DC2626]">
              MLX90640 Disconnected
            </h4>
            <p className="mt-1 text-xs text-[#94A3B8] max-w-sm">
              Waiting for thermal camera array on I2C bus 0x33. Verify connections on GPIO 21 (SDA) and GPIO 22 (SCL).
            </p>
          </div>
        ) : (
          <>
            {/* Thermal Grid Matrix */}
            <div className="grid h-full w-full grid-cols-8 grid-rows-6 gap-0.5 p-1 bg-[#0B0D12]">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-sm transition-colors duration-300"
                  style={{
                    backgroundColor:
                      i === 22
                        ? "#DC2626"
                        : i === 21 || i === 23 || i === 30
                        ? "#D97706"
                        : i > 15 && i < 35
                        ? "#2563EB"
                        : "#151922",
                    opacity: 0.9,
                  }}
                />
              ))}
            </div>

            {/* Target Reticle Crosshair */}
            <div className="absolute left-[54%] top-[42%] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#DC2626]">
              <div className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            </div>

            {/* Target Position HUD */}
            <div className="absolute left-3 top-3 rounded border border-[#2A3140] bg-[#0B0D12]/90 px-3 py-1.5 font-mono text-xs text-[#F8FAFC]">
              <span className="text-[#94A3B8]">HOTSPOT:</span>{" "}
              <b className="text-[#DC2626] font-bold">{thermalFrame.maxTemp}°C</b> (X: {thermalFrame.hotspotX}, Y: {thermalFrame.hotspotY})
            </div>
          </>
        )}
      </div>
    </div>
  );
}
