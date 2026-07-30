import React from "react";
import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export interface AlertCardProps {
  level: string;
  title: string;
  text: string;
  time: string;
  badgeTone: string;
  iconTone: string;
  onReview?: () => void;
}

export function AlertCard({
  level,
  title,
  text,
  time,
  badgeTone,
  iconTone,
  onReview,
}: AlertCardProps) {
  const handleReview = () => {
    if (onReview) {
      onReview();
    } else {
      toast.success(`Event Reviewed: ${title}`, {
        description: `Logged at ${time}. Telemetry baseline verified.`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-5 backdrop-blur-xl shadow-xl shadow-black/30 transition-all duration-300 hover:border-white/[0.16] hover:shadow-2xl"
    >
      <div className="flex items-start gap-4">
        <div className={`grid h-11 w-11 place-items-center rounded-xl border border-white/10 ${iconTone} shadow-md`}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeTone}`}>
              {level}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">{text}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <span className="font-mono text-xs text-slate-500">{time}</span>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleReview}
          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition"
        >
          Review Event
        </motion.button>
      </div>
    </motion.div>
  );
}
