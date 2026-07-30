import React, { useEffect, useState } from "react";
import { Bell, Menu, Radio, Tv, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useTelemetry } from "../../context/TelemetryContext";
import { PresentationView } from "./PresentationView";

export interface TopHeaderProps {
  pageName: string;
  onOpenMobileMenu: () => void;
}

export function TopHeader({ pageName, onOpenMobileMenu }: TopHeaderProps) {
  const { mode, setMode, isOnline, isConnecting, hasError } = useTelemetry();
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

  const handleNotificationClick = () => {
    toast.info("Incident Log", {
      description: "No active critical safety trips pending.",
    });
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-[#2A3140] bg-[#0B0D12] px-6">
        <div className="flex items-center gap-4">
          <button
            aria-label="Open mobile menu"
            className="grid h-8 w-8 place-items-center rounded border border-[#2A3140] bg-[#151922] text-[#94A3B8] hover:text-[#F8FAFC] lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#F8FAFC]">
              {pageName}
            </h1>
          </div>
        </div>

        {/* Telemetry Status, Mode Switcher & Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          {!isOnline || hasError ? (
            <span className="flex items-center gap-1.5 rounded border border-[#DC2626]/40 bg-[#DC2626]/10 px-2.5 py-1 font-mono text-xs font-medium text-[#DC2626]">
              <WifiOff size={14} /> Disconnected
            </span>
          ) : (
            <div className="hidden items-center gap-2 font-mono text-xs text-[#94A3B8] md:flex">
              <span className="flex items-center gap-1.5 rounded border border-[#16A34A]/30 bg-[#16A34A]/10 px-2.5 py-1 text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" /> ESP32 Online
              </span>
            </div>
          )}

          {/* Presentation Mode Button */}
          <button
            onClick={() => setIsPresentation(true)}
            className="flex items-center gap-1.5 rounded border border-[#2A3140] bg-[#151922] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:bg-[#2A3140]/50 transition-colors"
          >
            <Tv size={14} className="text-[#94A3B8]" /> Presentation (F)
          </button>

          {/* Segmented Mode Switcher */}
          <div className="flex items-center rounded border border-[#2A3140] bg-[#151922] p-0.5 font-mono text-xs">
            <button
              onClick={() => setMode("demo")}
              className={`rounded px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                mode === "demo"
                  ? "bg-[#2563EB] text-[#F8FAFC]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setMode("live")}
              className={`rounded px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                mode === "live"
                  ? "bg-[#16A34A] text-[#F8FAFC]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              Live
            </button>
          </div>

          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            onClick={handleNotificationClick}
            className="grid h-8 w-8 place-items-center rounded border border-[#2A3140] bg-[#151922] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <Bell size={16} />
          </button>

          {/* Operator Badge */}
          <div className="hidden border-l border-[#2A3140] pl-3 text-xs font-mono text-[#94A3B8] sm:block">
            Operator #01
          </div>
        </div>
      </header>

      {/* Presentation Mode Overlay */}
      {isPresentation && (
        <PresentationView onExit={() => setIsPresentation(false)} />
      )}
    </>
  );
}
