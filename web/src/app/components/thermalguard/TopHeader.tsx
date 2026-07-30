import React, { useEffect, useState } from "react";
import { Bell, Menu, Radio, Tv, Wifi, WifiOff, Cpu } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useTelemetry } from "../../context/TelemetryContext";
import { PresentationView } from "./PresentationView";

export interface TopHeaderProps {
  pageName: string;
  onOpenMobileMenu: () => void;
}

export function TopHeader({ pageName, onOpenMobileMenu }: TopHeaderProps) {
  const { mode, setMode, isOnline, isConnecting, hasError } = useTelemetry();
  const [isPresentation, setIsPresentation] = useState(false);

  // Keyboard shortcut listener ('F' or 'Esc' to exit)
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
    toast.info("Active Telemetry Incidents", {
      description: "Review pending alert logs on the Safety Alerts page.",
      action: {
        label: "View Alerts",
        onClick: () => {
          window.location.hash = "/alerts";
        },
      },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.08] bg-[#070b14]/90 px-5 backdrop-blur-md lg:px-8">
        <div className="flex items-center gap-4">
          <button
            aria-label="Open mobile menu"
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              ESP32 Node #192.168.1.48 / <span className="text-blue-400 font-medium">{pageName}</span>
            </p>
            <h1 className="mt-0.5 text-base font-bold tracking-tight text-white md:text-lg">
              Operational Telemetry Console
            </h1>
          </div>
        </div>

        {/* Telemetry Controls, Mode Switcher & Operator Badge */}
        <div className="flex items-center gap-4">
          {/* Offline / Error Indicator */}
          {!isOnline || hasError ? (
            <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-xs font-bold text-rose-400 animate-pulse">
              <WifiOff size={13} /> {isOnline ? "ESP32 Gateway Offline" : "Network Disconnected"}
            </span>
          ) : (
            <div className="hidden items-center gap-3 text-xs text-slate-400 md:flex font-mono">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                <Wifi size={13} className="text-emerald-400 animate-pulse" /> WiFi 100%
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-blue-300">
                <Radio size={13} className="text-blue-400" /> {isConnecting ? "Polling..." : "ESP32 Connected"}
              </span>
            </div>
          )}

          {/* Presentation Mode Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsPresentation(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 font-mono text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition shadow-sm"
          >
            <Tv size={14} /> Projector Mode (F)
          </motion.button>

          {/* Live / Demo Mode Switcher */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] p-1 font-mono">
            <button
              onClick={() => setMode("demo")}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                mode === "demo"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setMode("live")}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                mode === "live"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Live
            </button>
          </div>

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Notifications"
            onClick={handleNotificationClick}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
          </motion.button>

          {/* Operator Role Badge */}
          <div className="flex items-center gap-2.5 border-l border-white/[0.08] pl-4">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-blue-500/30 bg-blue-900/40 font-mono text-xs font-extrabold text-blue-300 shadow-md">
              <Cpu size={18} />
            </div>
            <div className="hidden text-left xl:block font-mono">
              <p className="text-xs font-bold text-slate-200">Operator #01</p>
              <p className="text-[10px] text-slate-500">Electrical Engineering</p>
            </div>
          </div>
        </div>
      </header>

      {/* Presentation Mode View Overlay */}
      <AnimatePresence>
        {isPresentation && (
          <PresentationView onExit={() => setIsPresentation(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
