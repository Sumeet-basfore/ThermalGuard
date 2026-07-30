import React from "react";
import { NavLink } from "react-router";
import { LucideIcon, ShieldCheck, X } from "lucide-react";

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

export interface SidebarNavProps {
  navItems: readonly (readonly [string, LucideIcon, string])[];
  secondaryNavItems: readonly (readonly [string, LucideIcon, string])[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SidebarNav({
  navItems,
  secondaryNavItems,
  open,
  setOpen,
}: SidebarNavProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/[0.08] bg-[#0b111e]/95 px-4 py-5 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0 shadow-2xl shadow-black/80" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/30">
            <ShieldCheck size={22} className="text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b111e] bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
          </div>
          <div>
            <p className="text-base font-extrabold tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              THERMOGUARD
            </p>
            <p className="text-[9px] font-semibold tracking-[0.2em] text-blue-400">
              INDUSTRIAL SYSTEMS
            </p>
          </div>
          <button
            aria-label="Close navigation drawer"
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="mt-8">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Main Menu
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map(([path, Icon, label]) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500/15 text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`transition-colors ${
                        isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-6 border-t border-white/[0.08] pt-6">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Configuration
          </p>
          <nav className="mt-2 space-y-1">
            {secondaryNavItems.map(([path, Icon, label]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500/15 text-white border border-blue-500/30"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`transition-colors ${
                        isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Protection Status Card */}
        <div className="mt-auto rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
            </span>
            SYSTEM PROTECTED
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            On-device thermal AI active. Last inspection 3h ago.
          </p>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
