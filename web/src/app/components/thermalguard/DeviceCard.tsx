import React, { useState } from "react";
import { LucideIcon, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export interface DeviceCardProps {
  icon: LucideIcon;
  name: string;
  status: string;
  detail: string;
}

export function DeviceCard({ icon: Icon, name, status, detail }: DeviceCardProps) {
  const [testing, setTesting] = useState(false);

  const handleTestDevice = () => {
    setTesting(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: `Pinging ${name}...`,
        success: `${name} ping response 1.2ms (OK)`,
        error: `Failed to ping ${name}`,
        finally: () => setTesting(false),
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-5 backdrop-blur-xl shadow-xl shadow-black/30 transition-all duration-300 hover:border-white/[0.16] hover:shadow-2xl"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-md">
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="mt-0.5 text-xs text-slate-400 font-mono">{detail}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-300">
          ● {status}
        </span>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleTestDevice}
          aria-label={`Test ${name}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 hover:text-white transition"
        >
          <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
        </motion.button>
      </div>
    </motion.div>
  );
}
