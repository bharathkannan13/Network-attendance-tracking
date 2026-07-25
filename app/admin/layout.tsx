"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5B7FFF] border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(91,127,255,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-3d-bg text-slate-100 flex flex-col font-sans">
      
      {/* 2026 Enterprise Top Navigation Bar */}
      <header className="glass-card-3d sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0 px-6 sm:px-10 py-4 border-b border-white/10 backdrop-blur-2xl">
        <div className="w-full max-w-[2200px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5B7FFF] to-[#7B61FF] flex items-center justify-center shadow-[0_0_25px_rgba(91,127,255,0.45)] border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white glow-text-blue">
                  BK Ran Group
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#5B7FFF]/20 text-[#38BDF8] border border-[#5B7FFF]/40 tracking-wider">
                  ENTERPRISE 3D
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">BK Ran Attendance Connectivity Platform</p>
            </div>
          </div>

          {/* Center Search & Live Build Status */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search network sessions..." 
                className="bg-black/40 border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#5B7FFF] w-72 transition-all shadow-inner"
              />
            </div>
            
            <div className="px-4 py-2 rounded-xl text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Vercel Build: <strong>{versionInfo?.commit || '2af3272'}</strong> ({versionInfo?.status || 'READY'})</span>
            </div>
          </div>

          {/* Right Action Profile & Sign Out */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10 relative shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#5B7FFF] absolute top-2 right-2 animate-ping"></span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-white/15">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B7FFF] to-[#38BDF8] flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/20">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white">Administrator</p>
                <p className="text-[10px] text-slate-400 font-mono">admin@bkrangroup.com</p>
              </div>
            </div>

            <Button 
              variant="ghost" 
              onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }} 
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 rounded-xl px-4 py-2 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>

        </div>
      </header>

      {/* Main Content Area without Sidebar */}
      <div className="flex-1 max-w-[2200px] w-full mx-auto p-6 sm:p-8 lg:p-10">
        <main className="w-full space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
