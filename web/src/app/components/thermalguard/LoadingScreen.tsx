import React from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] font-[Inter] text-slate-100 selection:bg-blue-500/30">
      <div className="relative flex flex-col items-center">
        {/* Glowing Shield Logo */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-[0_0_35px_rgba(59,130,246,0.6)] border border-blue-400/40"
        >
          <ShieldCheck size={36} className="text-white" />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#070b14] bg-emerald-400 shadow-[0_0_10px_#22c55e]" />
        </motion.div>

        {/* Brand Name */}
        <h1 className="mt-6 text-2xl font-extrabold tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
          THERMOGUARD
        </h1>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
          INDUSTRIAL THERMAL INTELLIGENCE
        </p>

        {/* Progress Bar Loader */}
        <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
          />
        </div>

        <p className="mt-4 font-mono text-xs text-slate-500">
          Initializing ESP32 Edge Gateway...
        </p>
      </div>
    </div>
  );
}
