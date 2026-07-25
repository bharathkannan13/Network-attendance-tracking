'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BarChart3, 
  Download, 
  Settings2, 
  Search, 
  Bell, 
  LogOut, 
  Menu,
  X,
  Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VersionInfo {
  commit?: string;
  status?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => setVersionInfo(data))
      .catch((err) => console.error('Failed to fetch version info', err));
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Export', href: '/admin/export', icon: Download },
    { name: 'Settings', href: '/admin/settings', icon: Settings2 },
  ];

  return (
    <div className="min-h-screen text-neutral-100 flex overflow-hidden" style={{ backgroundColor: 'var(--bg, #060913)' }}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-white tracking-tight">BK Ran Group</div>
            <div className="text-[10px] font-bold text-indigo-400 tracking-wider">ENTERPRISE</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-1 lg:hidden text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Bottom Status */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Wifi className="w-4 h-4 text-emerald-400 mr-2" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-emerald-400">RAMBOLL-GUEST</span>
              <span className="text-[10px] text-emerald-500/70">Authorized</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex-shrink-0 bg-neutral-900/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-neutral-400 hover:text-white focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Search */}
            <div className="hidden sm:flex max-w-md w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search resources..."
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-black/20 text-neutral-300 placeholder-neutral-500 focus:outline-none focus:bg-black/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 sm:text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Vercel Status Badge */}
            <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-black/40 border border-white/5 text-xs text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Build: {versionInfo?.commit || "85cd77b"} · {versionInfo?.status || "READY"}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-neutral-400 hover:text-white focus:outline-none rounded-full hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-neutral-900"></span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-white/10"></div>

            {/* Profile & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neutral-700 to-neutral-600 flex items-center justify-center text-sm font-medium text-white shadow-inner border border-white/10 mr-2">
                  AD
                </div>
                <span className="text-sm font-medium text-neutral-300">Administrator</span>
              </div>
              
              <Button
                variant="ghost"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center text-sm px-3 py-1.5"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/');
                }}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-black/20 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
