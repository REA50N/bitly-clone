"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DashboardOutlined,
  BarChartOutlined,
  AddOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@mui/icons-material";

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: <BarChartOutlined />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      {/* Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/10 bg-[#0f1625] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-9 h-9 rounded-2xl bg-[#c0c1ff] flex items-center justify-center text-[#0d0096] font-bold text-xl">
              S
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-2xl tracking-tight">
                Shorten.it
              </span>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 border-t-cyan-100"
          >
            {isCollapsed ? <MenuOutlined /> : <CloseOutlined />}
          </button>
        </div>

        {/* New Link Button */}
        <div className="p-4">
          <Link href="/">
            <Button
              className={`w-full bg-[#c0c1ff] hover:bg-[#c0c1ff]/90 text-[#0d0096] gap-2 ${
                isCollapsed ? "justify-center px-3" : ""
              }`}
            >
              <AddOutlined />
              {!isCollapsed && "Create New Link"}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        {session?.user && (
          <div className="p-4 border-t border-white/10">
            <div
              className={`flex items-center gap-3 p-3 ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#c0c1ff] to-indigo-500 flex items-center justify-center font-semibold shrink-0">
                {session.user.name?.[0] || "U"}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              className={`w-full text-red-400 hover:bg-red-950/30 hover:text-red-300 ${isCollapsed ? "justify-center" : "justify-start"}`}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogoutOutlined className={isCollapsed ? "" : "mr-3"} />
              {!isCollapsed && "Logout"}
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
