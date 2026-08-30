"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  ShieldAlert, 
  FolderSearch, 
  BarChart3, 
  FileText, 
  HelpCircle,
  Database,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import apiClient from "@/api/client";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const PRIMARY_NAV: SidebarItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Investigations", href: "/investigations", icon: ShieldAlert },
  { name: "Projects", href: "/projects", icon: FolderSearch },
  { name: "Analytics", href: "/analytics", icon: BarChart3 }
];

const SECONDARY_NAV: SidebarItem[] = [
  { name: "Evidence Explorer", href: "/evidence", icon: FileText },
  { name: "Methodology & About", href: "/about", icon: HelpCircle }
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  useEffect(() => {
    // Fetch backend health to show status indicator
    apiClient.getHealth()
      .then(res => {
        if (res.status === "ok" && res.data_loaded) {
          setDbStatus("connected");
        } else {
          setDbStatus("disconnected");
        }
      })
      .catch(() => {
        setDbStatus("disconnected");
      });
  }, []);

  const getPageTitle = (path: string) => {
    const allNavs = [...PRIMARY_NAV, ...SECONDARY_NAV];
    const match = allNavs.find(item => item.href === path);
    if (match) return match.name;
    if (path.startsWith("/investigations/")) return "Case Investigation Profile";
    if (path.startsWith("/projects/")) return "Project Profile Explorer";
    return "Intelligence Platform";
  };

  const getBreadcrumbs = (path: string) => {
    const title = getPageTitle(path);
    if (path === "/") {
      return [{ name: "Nirikshak", href: "/" }, { name: "Dashboard", href: "/" }];
    }
    return [
      { name: "Nirikshak", href: "/" },
      { name: title, href: path }
    ];
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-hidden">
      
      {/* 1. Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 2. Responsive Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-full bg-[#0B1321] text-[#E2E8F0] border-r border-[#1E293B] transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-20"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:static lg:flex`}
      >
        {/* Logo and Brand Title Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#1E293B] bg-[#0F172A]">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center h-8 w-8 rounded bg-[#2563EB] text-white font-bold shrink-0">
              N
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-sm tracking-widest text-[#FFFFFF] whitespace-nowrap">
                NIRIKSHAK AI
              </span>
            )}
          </Link>
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#64748B] hover:text-[#E2E8F0]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {sidebarOpen && (
            <div className="px-3 mb-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Primary Directory
            </div>
          )}
          {PRIMARY_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                  ${isActive 
                    ? "bg-[#2563EB] text-[#FFFFFF]" 
                    : "text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B]/50"}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#FFFFFF]" : "text-[#64748B] group-hover:text-[#E2E8F0]"}`} />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}

          <div className="h-px bg-[#1E293B] my-6" />

          {sidebarOpen && (
            <div className="px-3 mb-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Secondary Directory
            </div>
          )}
          {SECONDARY_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group
                  ${isActive 
                    ? "bg-[#2563EB] text-[#FFFFFF]" 
                    : "text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B]/50"}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-[#FFFFFF]" : "text-[#64748B] group-hover:text-[#E2E8F0]"}`} />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapsible toggle buttons */}
        <div className="hidden lg:flex p-4 border-t border-[#1E293B] bg-[#0F172A]/30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full py-2 border border-[#1E293B] rounded-lg text-xs font-medium text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1E293B] transition"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <span className="flex items-center gap-1.5"><ChevronLeft className="h-4 w-4" /> Collapse</span>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        
        {/* Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-[#FFFFFF] px-6 shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-[#64748B] hover:text-[#0F172A]"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-[#64748B]">
                {getBreadcrumbs(pathname).map((crumb, idx) => (
                  <li key={crumb.name} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-[#E2E8F0] font-light">/</span>}
                    <Link 
                      href={crumb.href} 
                      className={`hover:text-[#0F172A] ${idx === getBreadcrumbs(pathname).length - 1 ? "font-semibold text-[#0F172A]" : ""}`}
                    >
                      {crumb.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Database status indicator badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs font-medium">
              <Database className="h-3.5 w-3.5 text-[#64748B]" />
              <span className="text-[#64748B] hidden md:inline">Core DB Status:</span>
              <span className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  dbStatus === "connected" ? "bg-[#0D9488]" : dbStatus === "loading" ? "bg-amber-500 animate-pulse" : "bg-red-600"
                }`} />
                <span className="capitalize text-slate-800 font-semibold text-[0.85em]">
                  {dbStatus === "loading" ? "Validating..." : dbStatus === "connected" ? "Online" : "Offline"}
                </span>
              </span>
            </div>
            
            {/* Search Placeholder */}
            <div className="relative hidden lg:block">
              <input
                type="search"
                placeholder="Search database (Record ID, MP, Work)..."
                disabled
                className="w-72 px-4 py-1.5 border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] rounded-md text-xs placeholder-[#64748B] opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </header>

        {/* Content body pane */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>

        {/* Persistent Audit/Methodology Disclaimer Banner */}
        <footer className="h-10 bg-[#1E293B] text-[#E2E8F0] border-t border-[#E2E8F0] flex items-center justify-center text-[0.78em] font-medium tracking-wide shrink-0 px-6 select-none text-center">
          <span>Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption.</span>
        </footer>

      </div>
    </div>
  );
};
export default AppShell;
