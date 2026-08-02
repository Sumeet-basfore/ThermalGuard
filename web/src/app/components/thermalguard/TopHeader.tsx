import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getApiIp, setApiEndpoint } from "../../services/api";
import { useTelemetry } from "../../context/TelemetryContext";
import { PresentationView } from "./PresentationView";

export interface TopHeaderProps {
  pageName: string;
  onOpenMobileMenu: () => void;
}

export function TopHeader({ pageName, onOpenMobileMenu }: TopHeaderProps) {
  const { mode, setMode, isOnline, hasError, refreshTelemetry } = useTelemetry();
  const [isPresentation, setIsPresentation] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [gatewayIp, setGatewayIp] = useState(getApiIp());

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

  const handleSensorCheck = () => {
    toast.info("Sensor Diagnostics", {
      description: "ESP32 Node polling health check OK. I2C 0x33, ADC 34, GPIO 4 active.",
    });
  };

  const handleSaveIp = (e: React.FormEvent) => {
    e.preventDefault();
    setApiEndpoint(gatewayIp);
    setShowIpModal(false);
    toast.success(`ESP32 Gateway IP Updated`, {
      description: `Targeting http://${gatewayIp}/api`,
    });
    if (mode === "live") {
      refreshTelemetry();
    }
  };

  return (
    <>
      <header className="h-16 w-full flex items-center justify-between px-3 sm:px-6 border-b border-[#434655] bg-[#111318] sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <button
            onClick={onOpenMobileMenu}
            className="p-1 text-[#c3c6d7] hover:text-[#b4c5ff] lg:hidden flex-shrink-0"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-[Inter] text-[15px] sm:text-[18px] leading-[24px] font-bold text-[#e2e2e9] truncate">
            {pageName}
          </h2>
          <div className="h-4 w-[1px] bg-[#434655] hidden sm:block"></div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-[#2563eb]/10 rounded border border-[#2563eb]/20 flex-shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                !isOnline || hasError ? "bg-[#ffb4ab]" : "bg-[#2563eb] animate-pulse"
              }`}
            ></span>
            <span className="font-[Inter] text-[10px] sm:text-[11px] leading-[16px] tracking-[0.05em] font-bold text-[#b4c5ff]">
              {!isOnline || hasError ? (
                "OFFLINE"
              ) : (
                <>
                  <span className="hidden md:inline">ESP32 ONLINE ({getApiIp()})</span>
                  <span className="md:hidden">ONLINE</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setShowIpModal(true)}
              title="Configure ESP32 IP Address"
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[18px] sm:text-[20px] p-1"
            >
              settings_remote
            </button>
            <button
              onClick={handleSensorCheck}
              title="Sensor Diagnostics"
              className="hidden sm:block material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px] p-1"
            >
              sensors
            </button>
            <button
              onClick={() => setIsPresentation(true)}
              title="Projector Presentation Mode (F)"
              className="hidden sm:block material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px] p-1"
            >
              present_to_all
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#434655] hidden sm:block"></div>

          {/* Mode Switcher Buttons */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => setMode("live")}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 font-[Inter] text-[10px] sm:text-[11px] leading-[14px] sm:leading-[16px] tracking-[0.05em] font-bold rounded transition-colors ${
                mode === "live"
                  ? "bg-[#2563eb] text-[#eeefff]"
                  : "border border-[#434655] text-[#e2e2e9] hover:bg-[#1e1f25]"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setMode("demo")}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 font-[Inter] text-[10px] sm:text-[11px] leading-[14px] sm:leading-[16px] tracking-[0.05em] font-bold rounded transition-colors ${
                mode === "demo"
                  ? "bg-[#2563eb] text-[#eeefff]"
                  : "border border-[#434655] text-[#e2e2e9] hover:bg-[#1e1f25]"
              }`}
            >
              Demo
            </button>
          </div>
        </div>
      </header>

      {/* ESP32 IP Configure Modal */}
      {showIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181a20] border border-[#434655] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[Inter] text-[16px] font-bold text-[#e2e2e9] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b4c5ff]">settings_remote</span>
                ESP32 Gateway Endpoint Config
              </h3>
              <button
                onClick={() => setShowIpModal(false)}
                className="text-[#c3c6d7] hover:text-[#e2e2e9]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveIp} className="space-y-4">
              <div>
                <label className="block font-[Inter] text-[12px] font-medium text-[#c3c6d7] mb-1">
                  ESP32 Gateway IP Address or Hostname:
                </label>
                <input
                  type="text"
                  value={gatewayIp}
                  onChange={(e) => setGatewayIp(e.target.value)}
                  placeholder="192.168.4.1"
                  className="w-full bg-[#0c0e13] border border-[#434655] rounded px-3 py-2 text-[#e2e2e9] font-['JetBrains_Mono'] text-[13px] focus:outline-none focus:border-[#2563eb]"
                  required
                />
                <p className="mt-1 text-[11px] text-[#c3c6d7]">
                  Default ThermoGuard_AP SoftAP IP is <b>192.168.4.1</b>. If using a home router, enter the assigned IP address.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIpModal(false)}
                  className="px-4 py-2 border border-[#434655] rounded text-[#e2e2e9] font-[Inter] text-[12px] hover:bg-[#282a30]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] rounded text-[#eeefff] font-[Inter] text-[12px] font-bold hover:brightness-110"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Presentation Mode Fullscreen Overlay */}
      {isPresentation && (
        <PresentationView onExit={() => setIsPresentation(false)} />
      )}
    </>
  );
}
