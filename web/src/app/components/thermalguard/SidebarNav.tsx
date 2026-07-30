import React from "react";
import { Link, useLocation } from "react-router";
import { Shield, X } from "lucide-react";

export interface SidebarNavProps {
  navItems: readonly (readonly [string, React.ComponentType<{ size?: number; className?: string }>, string])[];
  secondaryNavItems: readonly (readonly [string, React.ComponentType<{ size?: number; className?: string }>, string])[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SidebarNav({
  navItems,
  secondaryNavItems,
  open,
  setOpen,
}: SidebarNavProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 z-40 flex w-[240px] flex-col border-r border-[#2A3140] bg-[#0B0D12] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-[64px] items-center justify-between border-b border-[#2A3140] px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded bg-[#2563EB] text-white">
              <Shield size={16} />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-[#F8FAFC]">ThermalGuard</span>
              <span className="ml-2 rounded bg-[#151922] border border-[#2A3140] px-1.5 py-0.5 text-[10px] font-mono text-[#94A3B8]">v2.4</span>
            </div>
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="text-[#94A3B8] hover:text-[#F8FAFC] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Operations
            </p>
            <nav className="mt-2 space-y-1">
              {navItems.map(([path, Icon, label]) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#151922] text-[#F8FAFC] border border-[#2A3140]"
                        : "text-[#94A3B8] hover:bg-[#151922]/50 hover:text-[#F8FAFC]"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#2563EB]" : "text-[#64748B]"} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              System
            </p>
            <nav className="mt-2 space-y-1">
              {secondaryNavItems.map(([path, Icon, label]) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#151922] text-[#F8FAFC] border border-[#2A3140]"
                        : "text-[#94A3B8] hover:bg-[#151922]/50 hover:text-[#F8FAFC]"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#2563EB]" : "text-[#64748B]"} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Node Metadata Footer */}
        <div className="border-t border-[#2A3140] p-4 text-[11px] font-mono text-[#64748B]">
          <p>ESP32 Gateway Node #01</p>
          <p className="text-[#94A3B8]">IP: 192.168.1.48</p>
        </div>
      </aside>
    </>
  );
}
