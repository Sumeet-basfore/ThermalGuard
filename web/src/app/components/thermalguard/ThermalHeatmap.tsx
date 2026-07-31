import React, { useEffect, useRef, useState } from "react";
import { useTelemetry } from "../../context/TelemetryContext";

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    r = hue2rgb(h + 1 / 3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getPixelColor(
  val: number,
  minT: number,
  maxT: number,
  palette: "ironbow" | "rainbow" | "fire"
): [number, number, number] {
  const norm = Math.max(0, Math.min(1, (val - minT) / (maxT - minT || 1)));

  if (palette === "fire") {
    // Black -> Red -> Orange -> Yellow -> White
    if (norm < 0.25) return [Math.round(norm * 4 * 255), 0, 0];
    if (norm < 0.5) return [255, Math.round((norm - 0.25) * 4 * 165), 0];
    if (norm < 0.75) return [255, 165 + Math.round((norm - 0.5) * 4 * 90), 0];
    return [255, 255, Math.round((norm - 0.75) * 4 * 255)];
  }

  if (palette === "rainbow") {
    // Blue -> Cyan -> Green -> Yellow -> Red
    const h = (1 - norm) * 0.66; // 0.66 (blue) down to 0 (red)
    return hslToRgb(h, 1.0, 0.5);
  }

  // Default: Ironbow (Dark Blue -> Purple -> Orange -> Bright Yellow)
  if (norm < 0.25) return [Math.round(norm * 4 * 60), 0, Math.round(120 + norm * 4 * 135)];
  if (norm < 0.5) return [Math.round(60 + (norm - 0.25) * 4 * 170), 0, Math.round(255 - (norm - 0.25) * 4 * 150)];
  if (norm < 0.75) return [230, Math.round((norm - 0.5) * 4 * 180), 0];
  return [255, 180 + Math.round((norm - 0.75) * 4 * 75), Math.round((norm - 0.75) * 4 * 180)];
}

export function ThermalHeatmap() {
  const { thermalFrame, mode } = useTelemetry();
  const [palette, setPalette] = useState<"ironbow" | "rainbow" | "fire">("ironbow");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render 32x24 Spatial Thermal Camera Heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 32;
    const height = 24;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const minT = thermalFrame.minTemp || 20;
    const maxT = thermalFrame.maxTemp || 45;
    const pixels = thermalFrame.pixels && thermalFrame.pixels.length === 768
      ? thermalFrame.pixels
      : new Array(768).fill(25.0);

    for (let i = 0; i < 768; i++) {
      const temp = pixels[i];
      const [r, g, b] = getPixelColor(temp, minT, maxT, palette);
      const idx = i * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  }, [thermalFrame, palette]);

  // Hotspot Reticle Position (Percentage mapping 32x24 grid)
  const hotX = thermalFrame.hotspotX !== undefined ? (thermalFrame.hotspotX / 32) * 100 : 68;
  const hotY = thermalFrame.hotspotY !== undefined ? (thermalFrame.hotspotY / 24) * 100 : 58;

  return (
    <div className="bg-[#111318] border border-[#434655] p-6 rounded-xl relative overflow-hidden">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-[Inter] text-[18px] leading-[24px] font-medium text-[#e2e2e9]">
            MLX90640 Spatial Thermal Array
          </h3>
          <p className="font-[Inter] text-[13px] leading-[18px] text-[#c3c6d7]">
            768-pixel Infrared Thermal Matrix (32×24) · Mode: {mode.toUpperCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-['JetBrains_Mono'] text-[12px] text-[#b4c5ff]">FPS: {thermalFrame.fps || 8.0}</span>
          <span className="font-['JetBrains_Mono'] text-[12px] text-[#c3c6d7]">0x33 I2C</span>

          {/* Palette Selector */}
          <div className="flex items-center gap-1 bg-[#1a1b21] p-1 rounded border border-[#434655]">
            {(["ironbow", "rainbow", "fire"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-3 py-1 font-[Inter] text-[11px] uppercase tracking-wider font-bold rounded transition-colors ${
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
        {/* Render Canvas */}
        <canvas
          ref={canvasRef}
          width={32}
          height={24}
          className="w-full h-full"
          style={{ imageRendering: "pixelated" }}
        />

        {/* Target Reticle Crosshair */}
        <div
          className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#ff3d00] pointer-events-none transition-all duration-300"
          style={{ left: `${hotX}%`, top: `${hotY}%` }}
        >
          <div className="h-2 w-2 rounded-full bg-[#ff3d00] animate-ping" />
        </div>

        {/* Telemetry HUD Overlay */}
        <div className="absolute left-3 top-3 rounded-md border border-[#434655] bg-[#0c0e13]/90 px-3.5 py-2 font-['JetBrains_Mono'] text-[12px] text-[#e2e2e9] shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff3d00] animate-pulse"></span>
            <span className="text-[#c3c6d7]">HOTSPOT MAX:</span>{" "}
            <b className="text-[#ffb4ab] font-bold text-[14px]">{thermalFrame.maxTemp}°C</b>
          </div>
          <div className="text-[11px] text-[#c3c6d7] mt-1">
            RETICLE POS: X: {thermalFrame.hotspotX || 22}, Y: {thermalFrame.hotspotY || 14}
          </div>
          <div className="text-[11px] text-[#c3c6d7] mt-0.5">
            MIN: {thermalFrame.minTemp}°C | AVG: {thermalFrame.avgTemp}°C
          </div>
        </div>
      </div>
    </div>
  );
}
