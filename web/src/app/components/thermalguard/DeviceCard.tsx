import React from "react";
import { LucideIcon } from "lucide-react";

export interface DeviceCardProps {
  icon: LucideIcon;
  name: string;
  status: string;
  detail: string;
}

export function DeviceCard({ icon: Icon, name, status, detail }: DeviceCardProps) {
  const isOnline = status === "Online" || status === "Connected";

  return (
    <div className="rounded-lg border border-[#2A3140] bg-[#151922] p-4 shadow-sm transition-colors hover:border-[#64748B]/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[#94A3B8]">
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#F8FAFC]">{name}</h4>
            <p className="font-mono text-xs text-[#64748B]">{detail}</p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {isOnline ? (
            <>
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#16A34A]">{status}</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
              <span className="text-[#DC2626]">{status}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
