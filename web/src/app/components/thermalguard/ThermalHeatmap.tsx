import React, { useState } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

export function ThermalHeatmap() {
  const { thermalFrame, sensorStatus, mode, setMode } = useTelemetry();
  const [palette, setPalette] = useState<"ironbow" | "rainbow" | "fire">("ironbow");
  const [forcePreview, setForcePreview] = useState(false);

  const isDisconnected = !forcePreview && mode === "live" && !sensorStatus.mlx90640Connected;

  return (
    <div className="bg-[#111318] border border-[#434655] p-6 rounded-xl relative overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-[Inter] text-[18px] leading-[24px] font-medium text-[#e2e2e9]">
            MLX90640 Sensor Array
          </h3>
          <p className="font-[Inter] text-[13px] leading-[18px] text-[#c3c6d7]">
            768-pixel Spatial IR Matrix · Focal Plane: 1.2m
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-['JetBrains_Mono'] text-[12px] text-[#b4c5ff]">FPS: 8.0</span>
          <span className="font-['JetBrains_Mono'] text-[12px] text-[#c3c6d7]">0x33 ADDR</span>

          {/* Palette Selector */}
          <div className="flex items-center gap-1 bg-[#1a1b21] p-1 rounded border border-[#434655]">
            {(["ironbow", "rainbow", "fire"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-2 py-0.5 font-[Inter] text-[11px] uppercase tracking-wider font-bold rounded transition-colors ${
                  palette === p
                    ? "bg-[#2563eb] text-[#eeefff]"
                    : "text-[#c3c6d7] hover:text-[#e2e2e9]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Canvas Area */}
      <div className="relative bg-[#0c0e13] border border-[#434655] aspect-[4/3] w-full overflow-hidden rounded-lg">
        {isDisconnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0c0e13]/95 z-20">
            <span className="material-symbols-outlined text-[48px] text-[#ffb4ab]">wifi_off</span>
            <h4 className="mt-3 font-['JetBrains_Mono'] text-[14px] font-bold text-[#ffb4ab]">
              MLX90640 Disconnected
            </h4>
            <p className="mt-1 text-[13px] text-[#c3c6d7] max-w-sm">
              Waiting for device on I2C bus 0x33... Check SDA/SCL connections on GPIO 21 &amp; 22.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setMode("demo")}
                className="px-4 py-2 bg-[#2563eb] text-[#eeefff] font-[Inter] text-[12px] font-bold rounded hover:brightness-110 transition-all flex items-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                Switch to Demo Telemetry Stream
              </button>

              <button
                onClick={() => setForcePreview(true)}
                className="px-4 py-2 bg-[#282a2f] border border-[#434655] text-[#e2e2e9] font-[Inter] text-[12px] font-bold rounded hover:bg-[#33353a] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                Enable Thermal Matrix Preview
              </button>
            </div>
          </div>
        ) : null}

        {/* 32x24 Spatial Pixel Array Canvas */}
        <div className="grid h-full w-full grid-cols-8 grid-rows-6 gap-0.5 p-1 bg-[#0c0e13]">
          {Array.from({ length: 48 }).map((_, i) => {
            let color = "#1e1f25";
            if (palette === "ironbow") {
              color =
                i === 22
                  ? "#f1e529"
                  : i === 21 || i === 23 || i === 30
                  ? "#d03e1b"
                  : i > 15 && i < 35
                  ? "#41107b"
                  : "#000000";
            } else if (palette === "rainbow") {
              color =
                i === 22
                  ? "#ff0000"
                  : i === 21 || i === 23 || i === 30
                  ? "#ffff00"
                  : i > 15 && i < 35
                  ? "#00ff00"
                  : "#0000ff";
            } else {
              color =
                i === 22
                  ? "#ffffff"
                  : i === 21 || i === 23 || i === 30
                  ? "#ffff00"
                  : i > 15 && i < 35
                  ? "#ff8000"
                  : "#800000";
            }

            return (
              <div
                key={i}
                className="rounded-sm transition-colors duration-300"
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>

        {/* Target Reticle Crosshair */}
        <div className="absolute left-[54%] top-[42%] grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#ff3d00]">
          <div className="h-1.5 w-1.5 rounded-full bg-[#ff3d00]" />
        </div>

        {/* Target Telemetry HUD Overlay */}
        <div className="absolute left-3 top-3 rounded border border-[#434655] bg-[#0c0e13]/90 px-3 py-1.5 font-['JetBrains_Mono'] text-[12px] text-[#e2e2e9]">
          <span className="text-[#c3c6d7]">HOTSPOT:</span>{" "}
          <b className="text-[#ffb4ab] font-bold">{thermalFrame.maxTemp}°C</b> (X: {thermalFrame.hotspotX}, Y: {thermalFrame.hotspotY})
        </div>
      </div>
    </div>
  );
}
