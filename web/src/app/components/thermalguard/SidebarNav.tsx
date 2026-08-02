import React from "react";
import { useLocation } from "react-router";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
  Links,
} from "@/app/components/ui/sidebar";
import {
  LayoutDashboard,
  Thermometer,
  BarChart3,
  Bell,
  FileText,
  Cpu,
  Settings,
  Info,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export interface SidebarNavProps {
  navItems?: readonly (readonly [string, string, string])[];
  secondaryNavItems?: readonly (readonly [string, string, string])[];
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function SidebarNav({
  open: externalOpen,
  setOpen: externalSetOpen,
}: SidebarNavProps) {
  const location = useLocation();

  const primaryLinks: Links[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Thermal Monitor",
      href: "/thermal-monitor",
      icon: <Thermometer className="h-5 w-5" />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      label: "Logs",
      href: "/logs",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Devices",
      href: "/devices",
      icon: <Cpu className="h-5 w-5" />,
    },
  ];

  const secondaryLinks: Links[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: "About",
      href: "/about",
      icon: <Info className="h-5 w-5" />,
    },
  ];

  return (
    <Sidebar open={externalOpen} setOpen={externalSetOpen} animate={true}>
      <SidebarNavContent
        primaryLinks={primaryLinks}
        secondaryLinks={secondaryLinks}
        currentPath={location.pathname}
      />
    </Sidebar>
  );
}

function SidebarNavContent({
  primaryLinks,
  secondaryLinks,
  currentPath,
}: {
  primaryLinks: Links[];
  secondaryLinks: Links[];
  currentPath: string;
}) {
  const { open, setOpen } = useSidebar();

  return (
    <SidebarBody className="justify-between gap-6 bg-[#111318] border-r border-[#2d313d] text-[#e2e2e9]">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 py-2 px-1 mb-5 border-b border-[#2d313d]/80 pb-4">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img
              src="/Logo.jpeg"
              alt="ThermalGuard Logo"
              className="w-7 h-7 rounded-lg object-cover border border-[#434655] shadow-sm"
            />
          </div>
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="overflow-hidden whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <h1 className="font-[Inter] text-[18px] leading-[22px] font-bold tracking-tight text-[#f0f0f5]">
                ThermalGuard
              </h1>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" title="System Online" />
            </div>
            <p className="font-['JetBrains_Mono'] text-[10px] leading-[14px] tracking-[0.05em] font-semibold text-[#8b91a3]">
              v2.4 STABLE
            </p>
          </motion.div>
        </div>

        {/* Primary Links */}
        <div className="flex flex-col gap-1.5">
          {primaryLinks.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <SidebarLink
                key={link.href}
                link={{
                  ...link,
                  icon: React.cloneElement(link.icon as React.ReactElement, {
                    className: `h-5 w-5 transition-colors ${
                      isActive
                        ? "text-[#60a5fa]"
                        : "text-[#8b91a3] group-hover/sidebar:text-[#b4c5ff]"
                    }`,
                  }),
                }}
                onClick={() => setOpen(false)}
                className={`py-2 px-2 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-[#2563eb]/20 via-[#2563eb]/10 to-transparent text-white font-medium border-l-[3px] border-[#3b82f6] shadow-sm"
                    : "text-[#a1a5b7] hover:bg-[#1c1e26] hover:text-[#e2e2e9]"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Footer / Active Node & Secondary Links */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[#2d313d]/80">
        {/* Active Node Card */}
        <div className="bg-[#171920] p-2 rounded-lg border border-[#2d313d] flex items-center gap-2.5 transition-colors hover:border-[#3b82f6]/40">
          <div className="w-7 h-7 flex items-center justify-center shrink-0 rounded-md bg-[#2563eb]/10 border border-[#2563eb]/20">
            <Radio className="h-4 w-4 text-[#60a5fa] animate-pulse" />
          </div>
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="overflow-hidden whitespace-nowrap min-w-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-[Inter] text-[9px] leading-[12px] tracking-[0.06em] font-bold uppercase text-[#60a5fa]">
                ACTIVE NODE
              </span>
              <CheckCircle2 className="w-3 h-3 text-[#34d399]" />
            </div>
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#e2e2e9] truncate font-medium">
              ESP32 Gateway #01
            </p>
          </motion.div>
        </div>

        {/* Secondary Links */}
        <div className="flex flex-col gap-1">
          {secondaryLinks.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <SidebarLink
                key={link.href}
                link={{
                  ...link,
                  icon: React.cloneElement(link.icon as React.ReactElement, {
                    className: `h-4 w-4 transition-colors ${
                      isActive
                        ? "text-[#60a5fa]"
                        : "text-[#8b91a3] group-hover/sidebar:text-[#b4c5ff]"
                    }`,
                  }),
                }}
                onClick={() => setOpen(false)}
                className={`py-1.5 px-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#1c1e26] text-[#60a5fa] font-medium"
                    : "text-[#8b91a3] hover:text-[#e2e2e9] hover:bg-[#1c1e26]"
                }`}
              />
            );
          })}
        </div>
      </div>
    </SidebarBody>
  );
}
