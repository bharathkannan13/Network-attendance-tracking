"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Wifi, 
  BarChart3, 
  FileSpreadsheet, 
  Download, 
  Settings, 
  LogOut,
  Bell,
  Search,
  UserCheck
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [versionInfo, setVersionInfo] = useState<any>(null);

  useEffect(() => {
    setIsChecking(false);
    fetch('/api/version')
      .then(res => res.json())
      .then(data => setVersionInfo(data))
      .catch(() => {});
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#080B14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#5B7FFF] border-t-transparent rounded-full animate-spin shadow-[0_0_25px_rgba(91,127,255,0.4)]"></div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', active: true },
    { label: 'Attendance', icon: UserCheck, href: '/admin' },
    { label: 'Connected Users', icon: Users, href: '/admin' },
    { label: 'Analytics', icon: BarChart3, href: '/admin' },
    { label: 'Reports', icon: FileSpreadsheet, href: '/admin' },
    { label: 'Export', icon: Download, href: '/admin' },
    { label: 'Settings', icon: Settings, href: '/admin' },
  ];

  return (
    <div className="min-h-screen aurora-bg text-slate-100 flex flex-col font-sans">
      {/* 2026 Enterprise Top Navigation Bar */}
      <header className="glass-card sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 px-4 sm:px-6 md:px-8 lg:px-12 py-3.5 border-b border-white/10 backdrop-blur-2xl">
        <div className="w-full max-w-[2400px] mx-auto flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5B7FFF] to-[#7B61FF] flex items-center justify-center shadow-[0_0_20px_rgba(91,127,255,0.4)]">
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                BK Ran Group <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-[#5B7FFF]/20 text-[#38BDF8] border border-[#5B7FFF]/30">ENTERPRISE</span>
              </h1>
              <p className="text-[11px] text-slate-400">BK Ran Attendance Connectivity System</p>
            </div>
          </div>

          {/* Center Search & Live Build Status */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search network sessions..." 
                className="bg-black/30 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#5B7FFF] w-64 transition-all"
              />
            </div>
            
            <div className="px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Vercel Build: {versionInfo?.commit || 'ceba87b'} ({versionInfo?.status || 'READY'})
            </div>
          </div>

          {/* Right Action Profile & Sign Out */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#5B7FFF] absolute top-1.5 right-1.5"></span>
            </button>

            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B7FFF] to-[#38BDF8] flex items-center justify-center text-xs font-bold text-white shadow-md">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white">Administrator</p>
                <p className="text-[10px] text-slate-400">admin@bkrangroup.com</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }} 
              className="text-xs hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/5 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>

        </div>
      </header>

      {/* Main Container with Sidebar + Dashboard Content */}
      <div className="flex-1 max-w-[2400px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6">
        
        {/* Floating Glass Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="glass-card rounded-[24px] p-4 space-y-2 sticky top-24 border border-white/10 shadow-2xl">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-3 py-2">Navigation Menu</p>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    idx === 0 
                      ? 'bg-gradient-primary text-white shadow-[0_4px_20px_rgba(91,127,255,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-6 border-t border-white/5">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#5B7FFF]/10 to-[#7B61FF]/10 border border-[#5B7FFF]/20 text-center space-y-2">
                <Wifi className="w-5 h-5 text-[#5B7FFF] mx-auto animate-pulse" />
                <p className="text-xs font-bold text-white">BK Ran Connect</p>
                <p className="text-[10px] text-slate-400">Subnet Security Active</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
