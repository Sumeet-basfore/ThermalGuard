import React from "react";
import { Link, useLocation } from "react-router";
import { X, Thermometer, LayoutDashboard, Activity, Gauge, AlertTriangle, Database, Cpu, Settings, CircleHelp } from "lucide-react";

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
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 z-50 flex w-[240px] flex-col border-r border-[#434655] bg-[#111318] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-sm">
                <Thermometer size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#e2e2e9]">ThermalGuard</h1>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#c3c6d7] opacity-60">v2.4</p>
              </div>
            </Link>

            <button
              onClick={() => setOpen(false)}
              className="text-[#c3c6d7] hover:text-[#e2e2e9] lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map(([path, Icon, label]) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-l-2 border-[#2563eb] bg-[#282a2f] text-[#e2e2e9] font-semibold"
                      : "text-[#c3c6d7] hover:bg-[#282a2f] hover:text-[#e2e2e9]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#b4c5ff]" : "text-[#8d90a0]"} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings & Status */}
        <div className="mt-auto border-t border-[#434655] p-6 pt-4">
          <div className="mb-4 rounded bg-[#1e1f25] px-3 py-2">
            <p className="font-mono text-[11px] font-bold tracking-wider text-[#2563eb]">NODE STATUS</p>
            <p className="font-mono text-xs text-[#e2e2e9]">ESP32 Gateway Node #01</p>
          </div>

          <nav className="flex flex-col gap-1">
            {secondaryNavItems.map(([path, Icon, label]) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-l-2 border-[#2563eb] bg-[#282a2f] text-[#e2e2e9] font-semibold"
                      : "text-[#c3c6d7] hover:bg-[#282a2f] hover:text-[#e2e2e9]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#b4c5ff]" : "text-[#8d90a0]"} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
