'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BarChart3, 
  Download, 
  Bell, 
  LogOut, 
  Menu,
  X,
  Wifi,
  UserCheck,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VersionInfo {
  commit?: string;
  status?: string;
}

interface Notification {
  id: string;
  username: string;
  message: string;
  time: string;
  read: boolean;
}

interface AttendanceRecord {
  id: string;
  username: string;
  status: string;
  firstSeen: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [knownUsers, setKnownUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => setVersionInfo(data))
      .catch((err) => console.error('Failed to fetch version info', err));
  }, []);

  // Poll attendance data to detect new user connections
  const checkForNewConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance');
      if (!res.ok) return;
      const records: AttendanceRecord[] = await res.json();
      const onlineUsers = records.filter(r => r.status?.toLowerCase() === 'online');
      
      onlineUsers.forEach(record => {
        if (!knownUsers.has(record.username)) {
          const newNotif: Notification = {
            id: `${record.username}-${Date.now()}`,
            username: record.username,
            message: `${record.username} connected to the network`,
            time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }),
            read: false,
          };
          setNotifications(prev => [newNotif, ...prev].slice(0, 20));
        }
      });

      setKnownUsers(new Set(onlineUsers.map(r => r.username)));
    } catch (e) { /* silent */ }
  }, [knownUsers]);

  useEffect(() => {
    checkForNewConnections();
    const interval = setInterval(checkForNewConnections, 5000);
    return () => clearInterval(interval);
  }, [checkForNewConnections]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="h-screen w-screen text-slate-100 flex overflow-hidden" style={{ backgroundColor: '#060913', height: '100vh', width: '100vw' }}>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}
        style={{ backgroundColor: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-tight">BK Ran Group</div>
            <div className="text-[9px] font-bold text-indigo-400 tracking-[0.2em] uppercase">Enterprise</div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-1.5 lg:hidden text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Navigation</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
                style={isActive ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(99,102,241,0.2)' } : {}}
              >
                <Icon className={`w-[18px] h-[18px] mr-3 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Bottom Network Status */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center px-3 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Wifi className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-emerald-400">RAMBOLL-GUEST</span>
              <span className="text-[10px] text-emerald-500/60">Authorized Network</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0"
          style={{ backgroundColor: '#060913', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div className="flex items-center flex-1 gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white focus:outline-none rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          {/* Centered BK Ran Group Connect Heading */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">BKRAN Group Connect</h2>
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-emerald-400" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              {versionInfo?.status || 'READY'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Build Badge */}
            <div className="hidden lg:flex items-center px-2.5 py-1 rounded-lg text-[10px] text-slate-500 font-mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              Build: {versionInfo?.commit?.slice(0,7) || '7303bf9'}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) markAllRead(); }}
                className="relative p-2 text-slate-400 hover:text-white focus:outline-none rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white px-1 shadow-lg shadow-indigo-500/40">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-px bg-white/8"></div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-[11px] font-bold text-indigo-300 border border-indigo-500/20">
                  AD
                </div>
                <span className="text-xs font-semibold text-slate-300">Admin</span>
              </div>
              
              <Button
                variant="ghost"
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center text-xs px-3 py-1.5 rounded-xl"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/');
                }}
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Centered Overlay Notification Modal */}
        {showNotifications && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[9998]" onClick={() => setShowNotifications(false)} />
            
            {/* Modal Dialog */}
            <div className="bg-[#0b1021] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden z-[9999] shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col max-h-[70vh] animate-fade-in">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-white">Live Network Connections</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">{notifications.length} connected</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 p-4 rounded-xl flex items-start gap-3 transition-all">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <UserCheck className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs text-slate-200 font-semibold truncate">{n.username}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" /> {n.time}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0 animate-pulse" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-3">
                    <Bell className="w-10 h-10 text-slate-600" />
                    <p className="text-xs font-medium">No connection activity alerts yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content with clean margins and container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 xl:p-16">
          <div className="max-w-[1500px] mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
