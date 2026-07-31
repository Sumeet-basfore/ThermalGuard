import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTelemetry } from "../../context/TelemetryContext";
import { getActiveIp, setApiEndpoint } from "../../services/api";
import { PresentationView } from "./PresentationView";

export interface TopHeaderProps {
  pageName: string;
  onOpenMobileMenu: () => void;
}

export function TopHeader({ pageName, onOpenMobileMenu }: TopHeaderProps) {
  const { mode, setMode, isOnline, hasError, refreshTelemetry } = useTelemetry();
  const [isPresentation, setIsPresentation] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [inputIp, setInputIp] = useState(getActiveIp());
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (document.activeElement?.tagName !== "INPUT") {
          setIsPresentation((prev) => !prev);
        }
      } else if (e.key === "Escape") {
        setIsPresentation(false);
        setShowIpModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveIp = async () => {
    setPinging(true);
    setApiEndpoint(inputIp);
    try {
      await refreshTelemetry();
      toast.success("ESP32 Target Updated", {
        description: `Gateway target set to http://${inputIp}/api`,
      });
      setShowIpModal(false);
    } catch {
      toast.error("Gateway Unreachable", {
        description: `Could not connect to ESP32 at http://${inputIp}/api`,
      });
    } finally {
      setPinging(false);
    }
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

          {/* Interactive Connection Status Badge */}
          <button
            onClick={() => setShowIpModal(true)}
            className="flex items-center gap-2 px-2.5 py-1 bg-[#2563eb]/10 rounded border border-[#2563eb]/20 hover:bg-[#2563eb]/20 transition-colors"
            title="Configure ESP32 Gateway IP Address"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !isOnline || hasError ? "bg-[#ffb4ab]" : "bg-[#2563eb] animate-pulse"
              }`}
            ></span>
            <span className="font-[Inter] text-[11px] leading-[16px] tracking-[0.05em] font-bold text-[#b4c5ff]">
              {!isOnline || hasError ? "ESP32 OFFLINE" : "ESP32 ONLINE"}
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#c3c6d7]">({inputIp})</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Action Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowIpModal(true)}
              title="Configure Gateway Target IP"
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

      {/* ESP32 IP Configuration Modal */}
      {showIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-[#111318] border border-[#434655] rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#434655] pb-3">
              <h3 className="font-[Inter] text-[16px] font-bold text-[#e2e2e9]">
                Configure ESP32 Gateway Endpoint
              </h3>
              <button
                onClick={() => setShowIpModal(false)}
                className="text-[#c3c6d7] hover:text-[#e2e2e9] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 font-[Inter] text-[13px]">
              <div>
                <label className="block text-[12px] font-bold text-[#c3c6d7] mb-1">
                  ESP32 Gateway IP Address or Hostname
                </label>
                <input
                  type="text"
                  value={inputIp}
                  onChange={(e) => setInputIp(e.target.value)}
                  placeholder="192.168.1.48"
                  className="w-full bg-[#1a1b21] border border-[#434655] p-2 text-[#e2e2e9] font-['JetBrains_Mono'] rounded outline-none focus:border-[#2563eb]"
                />
                <p className="mt-1.5 text-[11px] text-[#c3c6d7]">
                  Default AP: <b className="font-mono text-[#b4c5ff]">192.168.4.1</b> · Station: <b className="font-mono text-[#b4c5ff]">192.168.1.48</b>
                </p>
              </div>

              <div className="p-3 bg-[#1a1b21] border border-[#434655] rounded text-[11px] text-[#c3c6d7] space-y-1 font-['JetBrains_Mono']">
                <p className="text-[#b4c5ff] font-bold">HTTPS Mixed Content Note:</p>
                <p>
                  If loaded on Vercel over <b className="text-white">HTTPS</b>, your browser may block HTTP requests to local IPs. Use <b className="text-[#b4c5ff]">Demo Mode</b> for cloud previews or run locally over HTTP to stream live telemetry.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowIpModal(false)}
                  className="px-3 py-1.5 bg-[#282a2f] text-[#c3c6d7] font-bold text-[12px] rounded hover:bg-[#33353a]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveIp}
                  disabled={pinging}
                  className="px-4 py-1.5 bg-[#2563eb] text-[#eeefff] font-bold text-[12px] rounded hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {pinging ? "Connecting..." : "Save & Ping Gateway"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Mode Overlay */}
      {isPresentation && (
        <PresentationView onExit={() => setIsPresentation(false)} />
      )}
    </>
  );
}
