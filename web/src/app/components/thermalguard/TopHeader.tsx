import React, { useEffect, useState } from "react";
import { Bell, Menu, Radio, Tv, Wifi, WifiOff, Sensors } from "lucide-react";
import { toast } from "sonner";
import { useTelemetry } from "../../context/TelemetryContext";
import { PresentationView } from "./PresentationView";

export interface TopHeaderProps {
  pageName: string;
  onOpenMobileMenu: () => void;
}

export function TopHeader({ pageName, onOpenMobileMenu }: TopHeaderProps) {
  const { mode, setMode, isOnline, isConnecting, hasError, refreshTelemetry } = useTelemetry();
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

  const handleManualRefresh = () => {
    toast.promise(refreshTelemetry(), {
      loading: "Polling ESP32 Gateway Node #01...",
      success: "Telemetry channel refreshed OK",
      error: "ESP32 Gateway response timeout",
    });
  };

  const handleNotificationClick = () => {
    toast.info("Active Incidents", {
      description: "0 critical trip alarms pending.",
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#434655] bg-[#111318] px-6">
        <div className="flex items-center gap-4">
          <button
            aria-label="Open mobile menu"
            className="grid h-8 w-8 place-items-center rounded border border-[#434655] bg-[#1e1f25] text-[#c3c6d7] hover:text-[#e2e2e9] lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu size={18} />
          </button>

          <h2 className="text-lg font-bold text-[#e2e2e9]">{pageName}</h2>
          <div className="h-4 w-[1px] bg-[#434655]" />

          {!isOnline || hasError ? (
            <div className="flex items-center gap-2 rounded bg-[#93000a]/20 px-2.5 py-1 font-mono text-[11px] font-bold text-[#ffb4ab]">
              <WifiOff size={13} />
              <span>DISCONNECTED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded bg-[#2563eb]/10 px-2.5 py-1 font-mono text-[11px] font-bold text-[#2563eb]">
              <span className="h-2 w-2 rounded-full bg-[#2563eb] animate-pulse" />
              <span>ESP32 ONLINE</span>
            </div>
          )}
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#c3c6d7]">
            <button
              onClick={handleManualRefresh}
              title="Manual Telemetry Sweep"
              className="grid h-8 w-8 place-items-center rounded hover:bg-[#282a2f] hover:text-[#2563eb] transition-colors"
            >
              <Radio size={18} />
            </button>

            <button
              onClick={() => setIsPresentation(true)}
              title="Projector Presentation Mode (F)"
              className="grid h-8 w-8 place-items-center rounded hover:bg-[#282a2f] hover:text-[#2563eb] transition-colors"
            >
              <Tv size={18} />
            </button>

            {/* Segmented Mode Switcher */}
            <div className="flex items-center rounded border border-[#434655] bg-[#1e1f25] p-0.5 font-mono text-xs">
              <button
                onClick={() => setMode("demo")}
                className={`rounded px-2 py-0.5 font-bold transition-colors ${
                  mode === "demo"
                    ? "bg-[#2563eb] text-white shadow-sm"
                    : "text-[#c3c6d7] hover:text-[#e2e2e9]"
                }`}
              >
                Demo
              </button>
              <button
                onClick={() => setMode("live")}
                className={`rounded px-2 py-0.5 font-bold transition-colors ${
                  mode === "live"
                    ? "bg-[#16A34A] text-white shadow-sm"
                    : "text-[#c3c6d7] hover:text-[#e2e2e9]"
                }`}
              >
                Live
              </button>
            </div>

            <button
              onClick={handleNotificationClick}
              title="Notifications"
              className="grid h-8 w-8 place-items-center rounded hover:bg-[#282a2f] hover:text-[#2563eb] transition-colors"
            >
              <Bell size={18} />
            </button>
          </div>

          <div className="hidden border-l border-[#434655] pl-4 font-mono text-xs text-[#8d90a0] md:block">
            Operator #01
          </div>
        </div>
      </header>

      {/* Presentation Mode View Overlay */}
      {isPresentation && (
        <PresentationView onExit={() => setIsPresentation(false)} />
      )}
    </>
  );
}
