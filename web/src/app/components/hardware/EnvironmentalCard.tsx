import React from "react";
import { Droplets, Thermometer } from "lucide-react";
import { useTelemetry } from "../../context/TelemetryContext";
import { AnimatedNumber } from "../thermalguard/AnimatedNumber";

export function EnvironmentalCard() {
  const { sensorMetrics, sensorStatus } = useTelemetry();

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0f172a]/75 p-6 backdrop-blur-xl shadow-xl shadow-black/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-md">
            <Thermometer size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">DHT11 Environmental Sensor</h3>
            <p className="text-xs text-slate-400 font-mono">ESP32 GPIO 4 · Ambient & Humidity</p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold ${
            sensorStatus.dht11Connected
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
          }`}
        >
          ● {sensorStatus.dht11Connected ? "DHT11 CONNECTED" : "DISCONNECTED"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#0a0f1d] p-4">
          <p className="text-xs font-semibold text-slate-400">Ambient Temperature</p>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">
            <AnimatedNumber value={sensorMetrics.ambientTemp} decimals={1} /> °C
          </div>
          <p className="mt-1 text-[10px] text-emerald-400 font-medium">● Operating within normal range</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0a0f1d] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">Relative Humidity</p>
            <Droplets size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-3xl font-extrabold text-white">
            <AnimatedNumber value={sensorMetrics.humidity} decimals={0} /> % RH
          </div>
          <p className="mt-1 text-[10px] text-cyan-400 font-medium">● Optimal environmental moisture</p>
        </div>
      </div>
    </div>
  );
}
