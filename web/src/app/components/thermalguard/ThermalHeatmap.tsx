import React, { useState } from "react";
import { Flame, Maximize2, Move, RefreshCw, WifiOff } from "lucide-react";
import { motion } from "motion/react";
import { useTelemetry } from "../../context/TelemetryContext";

export function ThermalHeatmap() {
  const { thermalFrame, sensorStatus } = useTelemetry();
  const [selectedPalette, setSelectedPalette] = useState<"ironbow" | "rainbow" | "fire">("ironbow");
  const isDisconnected = !sensorStatus.mlx90640Connected;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1322] p-6 backdrop-blur-xl shadow-2xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-md">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">MLX90640 Thermal Grid (32×24)</h3>
            <p className="text-xs text-slate-400 font-mono">I2C Bus 0x33 · 768 Sub-Pixels</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide transition ${
              isDisconnected
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_10px_#f43f5e] animate-pulse"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
          >
            ● {isDisconnected ? "Disconnected" : "Active Feed"}
          </span>

          <div className="flex rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
            {(["ironbow", "rainbow", "fire"] as const).map((palette) => (
              <button
                key={palette}
                onClick={() => setSelectedPalette(palette)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                  selectedPalette === palette
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {palette}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Canvas Screen */}
      <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-[#050810] shadow-inner">
        {isDisconnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-xl animate-pulse">
              <WifiOff size={32} />
            </div>
            <h4 className="mt-4 font-mono text-lg font-bold text-rose-400">
              MLX90640 Disconnected
            </h4>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Waiting for thermal camera array on I2C bus 0x33... Check physical wiring on GPIO 21 (SDA) &amp; GPIO 22 (SCL).
            </p>
          </div>
        ) : (
          <>
            {/* Thermal Grid Canvas Representation */}
            <div className="grid h-full w-full grid-cols-8 grid-rows-6 gap-0.5 p-1 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="relative rounded-sm transition-all duration-700"
                  style={{
                    backgroundColor:
                      i === 22
                        ? "#f43f5e"
                        : i === 21 || i === 23 || i === 30
                        ? "#f59e0b"
                        : i > 15 && i < 35
                        ? "#3b82f6"
                        : "#0f172a",
                    opacity: 0.85 + (i % 3) * 0.05,
                  }}
                />
              ))}
            </div>

            {/* Target Reticle Crosshair */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute left-[54%] top-[42%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-rose-500/80 shadow-[0_0_15px_#f43f5e]"
            >
              <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            </motion.div>

            {/* Target Position HUD */}
            <div className="absolute left-4 top-4 rounded-xl border border-white/20 bg-black/60 px-3.5 py-2 text-xs font-mono text-white backdrop-blur-md">
              <span className="text-slate-400">HOTSPOT:</span>{" "}
              <b className="text-rose-400 font-bold">{thermalFrame.maxTemp}°C</b> (X: {thermalFrame.hotspotX}, Y: {thermalFrame.hotspotY})
            </div>
          </>
        )}
      </div>
    </div>
  );
}
