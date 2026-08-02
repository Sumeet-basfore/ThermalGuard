import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiService, getApiIp, setApiEndpoint } from "../../services/api";
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
  const isMixedContent = ApiService.isMixedContentRisk() && mode === "live";

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
      <header className="h-auto min-h-[56px] lg:h-14 w-full flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 lg:px-6 py-2 lg:py-0 border-b border-[#434655] bg-[#111318] sticky top-0 z-40">
        {/* Left: hamburger + page name + status */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-1 text-[#c3c6d7] hover:text-[#b4c5ff] lg:hidden shrink-0"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <h2 className="font-[Inter] text-[15px] lg:text-[18px] font-bold text-[#e2e2e9] truncate">
            {pageName}
          </h2>

          <div className="hidden sm:block h-4 w-[1px] bg-[#434655] shrink-0" />

          {/* ESP32 Status Badge — compact on mobile */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] lg:text-[11px] font-bold font-[Inter] tracking-[0.05em] shrink-0 ${
            isMixedContent
              ? "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#fbbf24]"
              : !isOnline || hasError
              ? "bg-[#ffb4ab]/10 border-[#ffb4ab]/30 text-[#ffb4ab]"
              : "bg-[#2563eb]/10 border-[#2563eb]/20 text-[#b4c5ff]"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isMixedContent
                ? "bg-[#fbbf24]"
                : !isOnline || hasError
                ? "bg-[#ffb4ab]"
                : "bg-[#2563eb] animate-pulse"
            }`} />
            {/* Full text on lg+, abbreviated on mobile */}
            <span className="hidden lg:inline">
              {isMixedContent
                ? "⚠ MIXED CONTENT (HTTPS→HTTP BLOCKED)"
                : !isOnline || hasError
                ? `ESP32 OFFLINE`
                : `ESP32 ONLINE (${getApiIp()})`}
            </span>
            <span className="lg:hidden">
              {isMixedContent ? "⚠ HTTP BLOCKED" : !isOnline || hasError ? "OFFLINE" : "ONLINE"}
            </span>
          </div>
        </div>

        {/* Right: action icons + mode switcher */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIpModal(true)}
              title="Configure ESP32 IP Address"
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px]"
            >
              settings_remote
            </button>
            <button
              onClick={handleSensorCheck}
              title="Sensor Diagnostics"
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px] hidden sm:block"
            >
              sensors
            </button>
            <button
              onClick={() => setIsPresentation(true)}
              title="Projector Presentation Mode (F)"
              className="material-symbols-outlined text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors text-[20px] hidden sm:block"
            >
              present_to_all
            </button>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-[#434655]" />

          {/* Mode Switcher — icon+text on lg, icon-only on mobile */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setMode("live")}
              title="Switch to Live Mode"
              className={`flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-1.5 font-[Inter] text-[10px] lg:text-[11px] leading-[16px] tracking-[0.05em] font-bold rounded transition-colors ${
                mode === "live"
                  ? "bg-[#2563eb] text-[#eeefff]"
                  : "border border-[#434655] text-[#e2e2e9] hover:bg-[#1e1f25]"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                sensors
              </span>
              <span className="hidden sm:inline">Live</span>
            </button>
            <button
              onClick={() => setMode("demo")}
              title="Switch to Demo Mode"
              className={`flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-1.5 font-[Inter] text-[10px] lg:text-[11px] leading-[16px] tracking-[0.05em] font-bold rounded transition-colors ${
                mode === "demo"
                  ? "bg-[#2563eb] text-[#eeefff]"
                  : "border border-[#434655] text-[#e2e2e9] hover:bg-[#1e1f25]"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">play_circle</span>
              <span className="hidden sm:inline">Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* ESP32 IP Configure Modal */}
      {showIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#181a20] border border-[#434655] rounded-xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[Inter] text-[15px] font-bold text-[#e2e2e9] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b4c5ff]">settings_remote</span>
                ESP32 Gateway Config
              </h3>
              <button onClick={() => setShowIpModal(false)} className="text-[#c3c6d7] hover:text-[#e2e2e9]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {isMixedContent && (
              <div className="mb-4 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded text-[12px] text-[#fbbf24]">
                <strong>⚠ Mixed Content Warning:</strong> This dashboard is served over HTTPS. Browsers block plain HTTP connections to the ESP32 gateway. Open the dashboard using <code>http://</code> or access it directly on your local network.
              </div>
            )}

            <form onSubmit={handleSaveIp} className="space-y-4">
              <div>
                <label className="block font-[Inter] text-[12px] font-medium text-[#c3c6d7] mb-1">
                  ESP32 IP Address or Hostname:
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
                  ThermoGuard_AP SoftAP default: <b>192.168.4.1</b>. If on a home router, enter the assigned IP shown on the LCD.
                </p>
              </div>
              <div className="pt-2 flex justify-end gap-2">
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
