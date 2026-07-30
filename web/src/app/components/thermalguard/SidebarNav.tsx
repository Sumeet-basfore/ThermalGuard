import React from "react";
import { Link, useLocation } from "react-router";

export interface SidebarNavProps {
  navItems: readonly (readonly [string, string, string])[];
  secondaryNavItems: readonly (readonly [string, string, string])[];
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
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-[#434655] bg-[#111318] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col gap-1">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/Logo.jpeg"
              alt="ThermalGuard Logo"
              className="w-8 h-8 rounded-lg object-cover border border-[#434655]"
            />
            <div>
              <h1 className="font-[Inter] text-[24px] leading-[32px] font-bold text-[#e2e2e9]">ThermalGuard</h1>
              <p className="font-[Inter] text-[11px] leading-[16px] tracking-[0.05em] font-bold text-[#c3c6d7] opacity-60">v2.4</p>
            </div>
          </div>

          {/* Primary Navigation Menu */}
          <nav className="flex flex-col gap-1">
            {navItems.map(([path, iconName, label]) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 transition-all rounded ${
                    isActive
                      ? "text-[#e2e2e9] font-semibold border-l-2 border-[#2563eb] bg-[#282a2f]"
                      : "text-[#c3c6d7] hover:bg-[#282a2f] hover:text-[#e2e2e9]"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {iconName}
                  </span>
                  <span className="font-[Inter] text-[14px] leading-[20px]">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Active Node Status & Secondary Nav */}
        <div className="mt-auto p-6 border-t border-[#434655]">
          <div className="bg-[#1a1b21] px-3 py-2 rounded mb-4 border border-[#434655]">
            <p className="font-[Inter] text-[11px] leading-[16px] tracking-[0.05em] font-bold text-[#b4c5ff] mb-0.5">
              ACTIVE NODE
            </p>
            <p className="font-['JetBrains_Mono'] text-[12px] text-[#e2e2e9]">
              ESP32 Gateway Node #01
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {secondaryNavItems.map(([path, iconName, label]) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors rounded ${
                    isActive
                      ? "text-[#b4c5ff] font-semibold bg-[#282a2f]"
                      : "text-[#c3c6d7] hover:text-[#b4c5ff]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{iconName}</span>
                  <span className="font-[Inter] text-[14px] leading-[20px]">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
