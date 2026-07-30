import React, { useState } from "react";
import { Power } from "lucide-react";
import { toast } from "sonner";
import { useTelemetry } from "../../context/TelemetryContext";

export function RelayControlPanel() {
  const { sensorStatus } = useTelemetry();
  const [relayOn, setRelayOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleRelay = () => {
    setLoading(true);
    const nextState = !relayOn;
    setTimeout(() => {
      setRelayOn(nextState);
      setLoading(false);
      if (nextState) {
        toast.warning("Relay Engaged (GPIO 18)", {
          description: "Load line disconnected.",
        });
      } else {
        toast.success("Relay Disengaged (GPIO 18)", {
          description: "Load line restored to normal operation.",
        });
      }
    }, 300);
  };

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-[#2563EB]">
            <Power size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Safety Relay Interlock</h3>
            <p className="font-mono text-xs text-[#64748B]">GPIO 18 · Active Circuit Protection</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold">
          {relayOn ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-[#DC2626]">TRIPPED (OPEN)</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#16A34A]">CLOSED (NORMAL)</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded border border-[#2A3140] bg-[#0B0D12] p-3.5">
        <div>
          <p className="text-xs font-semibold text-[#F8FAFC]">Automated Overcurrent Interlock</p>
          <p className="mt-0.5 text-[11px] text-[#64748B] font-mono">
            Status: {sensorStatus.relayConnected ? "Connected (OK)" : "Disconnected"}
          </p>
        </div>

        <button
          onClick={handleToggleRelay}
          disabled={loading}
          className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
            relayOn
              ? "bg-[#16A34A] text-white hover:bg-[#16A34A]/80"
              : "bg-[#DC2626] text-white hover:bg-[#DC2626]/80"
          }`}
        >
          {loading ? "Engaging..." : relayOn ? "Restore Power" : "Emergency Trip"}
        </button>
      </div>
    </div>
  );
}
