import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

export function BuzzerAlarmPanel() {
  const [muted, setMuted] = useState(false);

  const handleTestBeep = () => {
    toast.info("Acoustic Beep (GPIO 19)", {
      description: "Triggered 100ms buzzer signal.",
    });
  };

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-[#D97706]">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Acoustic Warning Alarm</h3>
            <p className="font-mono text-xs text-[#64748B]">GPIO 19 · Hardware Buzzer</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 font-mono text-xs font-semibold">
          {muted ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#64748B]" />
              <span className="text-[#64748B]">MUTED</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#16A34A]">READY</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded border border-[#2A3140] bg-[#0B0D12] p-3.5">
        <div>
          <p className="text-xs font-semibold text-[#F8FAFC]">Acoustic Signal Trigger</p>
          <p className="mt-0.5 text-[11px] text-[#64748B] font-mono">Trip Threshold &gt; 45.0°C</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestBeep}
            className="rounded border border-[#2A3140] bg-[#151922] px-2.5 py-1 text-xs font-semibold text-[#F8FAFC] hover:bg-[#2A3140] transition-colors"
          >
            Test Beep
          </button>
          <button
            onClick={() => setMuted(!muted)}
            className="rounded border border-[#D97706]/40 bg-[#D97706]/10 px-2.5 py-1 text-xs font-semibold text-[#D97706] hover:bg-[#D97706]/20 transition-colors"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>
    </div>
  );
}
