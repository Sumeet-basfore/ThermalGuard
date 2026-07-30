import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export function BuzzerAlarmPanel() {
  const [muted, setMuted] = useState(false);

  const handleTestBeep = () => {
    toast.info("Acoustic Beep Triggered (GPIO 19)", {
      description: "Sounded 100ms active buzzer audio verification signal.",
    });
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-md">
            {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Active Buzzer Alarm</h3>
            <p className="text-xs text-slate-400 font-mono">ESP32 GPIO 19 · Acoustic Indicator</p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
            muted
              ? "bg-slate-500/20 text-slate-400 border-slate-500/30"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          }`}
        >
          ● {muted ? "MUTED" : "ALARM READY"}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0a0f1d] p-4">
        <div>
          <p className="text-xs font-semibold text-slate-200">High-Temp Acoustic Signal</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Triggers on threshold &gt; 45°C</p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleTestBeep}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/[0.08] transition"
          >
            Test Beep
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMuted(!muted)}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
          >
            {muted ? "Unmute" : "Mute Alarm"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
