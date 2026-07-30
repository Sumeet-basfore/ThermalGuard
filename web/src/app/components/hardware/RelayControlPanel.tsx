import React, { useState } from "react";
import { Power, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
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
        toast.warning("Safety Relay Engaged (GPIO 18)", {
          description: "Monitored electrical load line has been disconnected.",
        });
      } else {
        toast.success("Safety Relay Disengaged (GPIO 18)", {
          description: "Electrical load line restored to normal operation.",
        });
      }
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-md">
            <Power size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Safety Relay Control</h3>
            <p className="text-xs text-slate-400 font-mono">ESP32 GPIO 18 · Active Protection</p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
            relayOn
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_12px_#f43f5e]"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_#22c55e]"
          }`}
        >
          ● {relayOn ? "RELAY ENGAGED (OPEN)" : "NORMAL (CLOSED)"}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0f1d] p-4">
        <div>
          <p className="text-xs font-semibold text-slate-200">Automated Overcurrent Trip</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Hardware status: {sensorStatus.relayConnected ? "Connected (OK)" : "Disconnected"}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleToggleRelay}
          disabled={loading}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-lg ${
            relayOn
              ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500"
              : "bg-rose-600 text-white shadow-rose-600/30 hover:bg-rose-500"
          }`}
        >
          {loading ? "Engaging..." : relayOn ? "Restore Power" : "Emergency Disconnect"}
        </motion.button>
      </div>
    </div>
  );
}
