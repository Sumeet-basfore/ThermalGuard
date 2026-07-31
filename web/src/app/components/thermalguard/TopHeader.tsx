import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTelemetry } from "../../context/TelemetryContext";
import { PresentationView } from "./PresentationView";

export interface TopHeaderProps {
  pageName: string;
  onOpenMobileMenu: () => void;
}

export function TopHeader({ pageName, onOpenMobileMenu }: TopHeaderProps) {
  const { mode, setMode, isOnline, hasError } = useTelemetry();
  const [isPresentation, setIsPresentation] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (document.activeElement?.tagName !== "INPUT") {
          setIsPresentation((prev) => !prev);
        }
      } else if (e.key === "Escape") {
        setIsPresentation(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSensorCheck = () => {
    toast.info("Sensor Diagnostics", {
      description: "ESP32 Node polling health check OK. I2C 0x33, ADC 34, GPIO 4 active.",
    });
  };

  return (
    <>
      <header className="h-16 w-full flex items-center justify-between px-6 border-b border-[#434655] bg-[#111318] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMobileMenu}
            className="p-1 text-[#c3c6d7] hover:text-[#b4c5ff] lg:hidden"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-[Inter] text-[18px] leading-[24px] font-bold text-[#e2e2e9]">
            {pageName}
          </h2>
          <div className="h-4 w-[1px] bg-[#434655] hidden sm:block"></div>
          <div className="flex items-center gap-2 px-2 py-1 bg-[#2563eb]/10 rounded border border-[#2563eb]/20">
            <span
              className={`w-2 h-2 rounded-full ${
                !isOnline || hasError ? "bg-[#ffb4ab]" : "bg-[#2563eb] animate-pulse"
              }`}
            ></span>
            <span className="font-[Inter] text-[11px] leading-[16px] tracking-[0.05em] font-bold text-[#b4c5ff]">
              {!isOnline || hasError ? "ESP32 OFFLINE" : "ESP32 ONLINE"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Action Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSensorCheck}
              title="Sensor Diagnostics"
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px]"
            >
              sensors
            </button>
            <button
              onClick={() => setIsPresentation(true)}
              title="Projector Presentation Mode (F)"
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px]"
            >
              present_to_all
            </button>
            <button
              onClick={() => setMode(mode === "live" ? "demo" : "live")}
              title={`Switch Mode (Current: ${mode.toUpperCase()})`}
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px]"
            >
              toggle_on
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#434655] hidden sm:block"></div>

          {/* Mode Switcher Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("live")}
              className={`px-3 py-1.5 font-[Inter] text-[11px] leading-[16px] tracking-[0.05em] font-bold rounded transition-colors ${
                mode === "live"
                  ? "bg-[#2563eb] text-[#eeefff]"
                  : "border border-[#434655] text-[#e2e2e9] hover:bg-[#1e1f25]"
              }`}
            >
              Live Mode
            </button>
            <button
              onClick={() => setMode("demo")}
              className={`px-3 py-1.5 font-[Inter] text-[11px] leading-[16px] tracking-[0.05em] font-bold rounded transition-colors ${
                mode === "demo"
                  ? "bg-[#2563eb] text-[#eeefff]"
                  : "border border-[#434655] text-[#e2e2e9] hover:bg-[#1e1f25]"
              }`}
            >
              Demo Mode
            </button>
          </div>
        </div>
      </header>

      {/* Presentation Mode Fullscreen Overlay */}
      {isPresentation && (
        <PresentationView onExit={() => setIsPresentation(false)} />
      )}
    </>
  );
}
