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
      icon: <LayoutDashboard className="text-[#b4c5ff] h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Thermal Monitor",
      href: "/thermal-monitor",
      icon: <Thermometer className="text-[#ffb4ab] h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="text-[#b4c5ff] h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: <Bell className="text-[#ffb4ab] h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logs",
      href: "/logs",
      icon: <FileText className="text-[#c3c6d7] h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Devices",
      href: "/devices",
      icon: <Cpu className="text-[#c3c6d7] h-5 w-5 flex-shrink-0" />,
    },
  ];

  const secondaryLinks: Links[] = [
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="text-[#c3c6d7] h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "About",
      href: "/about",
      icon: <Info className="text-[#c3c6d7] h-5 w-5 flex-shrink-0" />,
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
    <SidebarBody className="justify-between gap-6 bg-[#111318] border-r border-[#434655] text-[#e2e2e9]">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 py-2 px-1 mb-6 border-b border-[#434655]/40 pb-4">
          <img
            src="/Logo.jpeg"
            alt="ThermalGuard Logo"
            className="w-8 h-8 rounded-lg object-cover border border-[#434655] flex-shrink-0"
          />
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="overflow-hidden whitespace-nowrap"
          >
            <h1 className="font-[Inter] text-[20px] leading-[24px] font-bold text-[#e2e2e9]">
              ThermalGuard
            </h1>
            <p className="font-[Inter] text-[10px] leading-[14px] tracking-[0.05em] font-bold text-[#c3c6d7] opacity-60">
              v2.4 STABLE
            </p>
          </motion.div>
        </div>

        {/* Primary Links */}
        <div className="flex flex-col gap-1">
          {primaryLinks.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <SidebarLink
                key={link.href}
                link={link}
                onClick={() => setOpen(false)}
                className={`px-2 py-2 rounded-md transition-all ${
                  isActive
                    ? "bg-[#282a2f] text-[#e2e2e9] font-semibold border-l-2 border-[#2563eb]"
                    : "text-[#c3c6d7] hover:bg-[#282a2f] hover:text-[#e2e2e9]"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Footer / Active Node & Secondary Links */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[#434655]">
        {/* Active Node Card */}
        <div className="bg-[#1a1b21] p-2.5 rounded border border-[#434655] flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#b4c5ff] animate-pulse flex-shrink-0" />
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="overflow-hidden whitespace-nowrap"
          >
            <p className="font-[Inter] text-[10px] leading-[12px] tracking-[0.05em] font-bold text-[#b4c5ff]">
              ACTIVE NODE
            </p>
            <p className="font-['JetBrains_Mono'] text-[11px] text-[#e2e2e9] truncate">
              ESP32 Gateway Node #01
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
                link={link}
                onClick={() => setOpen(false)}
                className={`px-2 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#282a2f] text-[#b4c5ff] font-semibold"
                    : "text-[#c3c6d7] hover:text-[#b4c5ff] hover:bg-[#282a2f]"
                }`}
              />
            );
          })}
        </div>
      </div>
    </SidebarBody>
  );
}
