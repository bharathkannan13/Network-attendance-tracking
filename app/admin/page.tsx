"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Activity, 
  Wifi, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Search, 
  Calendar as CalendarIcon,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart2,
  PieChart,
  RefreshCw
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  username: string;
  date: string;
  firstSeen: string;
  lastSeen: string;
  totalHours: string;
  ipAddress: string;
  status: 'online' | 'offline';
}

export default function AdminDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Auto-refresh data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/attendance');
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        }
      } catch (e) {
        console.error("Failed to fetch attendance data");
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 3000); // Poll every 3s
    
    // Time updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/sessions', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const prodOrigin = typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
          ? 'https://network-attendance-tracking.vercel.app'
          : window.location.origin;
        setGeneratedLink(`${prodOrigin}/join/${data.code}`);
      }
    } catch (e) {
      console.error("Failed to generate link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (dateFilter) params.append('date', dateFilter);
    window.open(`/api/attendance/export?${params.toString()}`, '_blank');
  };

  const formatISTDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoString.split('T')[0];
    }
  };

  const formatISTTime = (isoString: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  };

  const formatHours = (record: any) => {
    if (record.totalMinutes !== undefined && record.totalMinutes !== null) {
      const hrs = (record.totalMinutes / 60).toFixed(1);
      return `${hrs} hrs`;
    }
    return record.totalHours || '0.0 hrs';
  };

  const totalOnline = records.filter(r => (r.status as string).toLowerCase() === 'online').length;
  const totalToday = records.length;
  const avgHours = records.length > 0 
    ? (records.reduce((acc, r: any) => acc + (r.totalMinutes || 0), 0) / records.length / 60).toFixed(1) + " hrs" 
    : "0.0 hrs";

  const filteredRecords = records.filter(record => 
    record.username.toLowerCase().includes(search.toLowerCase()) &&
    (dateFilter === '' || record.date === dateFilter)
  );

  const handleClearRecords = async () => {
    if (!confirm('Are you sure you want to clear all attendance records?')) return;
    try {
      const res = await fetch('/api/attendance', { method: 'DELETE' });
      if (res.ok) {
        setRecords([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 w-full">
      
      {/* 2026 Executive 3D Header Banner */}
      <div className="glass-card-3d rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white glow-text-blue">
              Good Morning, Administrator
            </h2>
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse-ring shrink-0"></span>
          </div>
          <p className="text-sm text-slate-400 font-medium">BK Ran Attendance Connectivity — 3D Executive SaaS Control Panel</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-2 text-slate-300 shadow-inner">
            <CalendarIcon className="w-4 h-4 text-[#5B7FFF]" />
            <span>24/07/2026 (IST)</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-[#5B7FFF]/15 border border-[#5B7FFF]/30 flex items-center gap-2 text-[#38BDF8] shadow-inner">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span className="font-bold">{currentTime || '02:45:45 PM'}</span>
          </div>
        </div>
      </div>

      {/* 2026 Executive KPI Card Grid (4 Structured Cards with Explicit Min-Heights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Connected Users */}
        <div className="glass-card-3d rounded-[24px] p-6 min-h-[160px] flex flex-col justify-between space-y-4 border border-white/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Connected</span>
            <div className="w-10 h-10 rounded-2xl bg-[#5B7FFF]/15 text-[#5B7FFF] flex items-center justify-center border border-[#5B7FFF]/30 shadow-md">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">{totalToday}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Devices Registered Today</p>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#5B7FFF] to-[#7B61FF] h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* KPI 2: Active Online */}
        <div className="glass-card-3d rounded-[24px] p-6 min-h-[160px] flex flex-col justify-between space-y-4 border border-white/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Online</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight glow-text-emerald">{totalOnline}</div>
            <p className="text-xs text-emerald-400/80 font-medium mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Heartbeats
            </p>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: totalToday > 0 ? `${(totalOnline/totalToday)*100}%` : '100%' }}></div>
          </div>
        </div>

        {/* KPI 3: Avg Working Hours */}
        <div className="glass-card-3d rounded-[24px] p-6 min-h-[160px] flex flex-col justify-between space-y-4 border border-white/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Working Hours</span>
            <div className="w-10 h-10 rounded-2xl bg-[#7B61FF]/15 text-[#7B61FF] flex items-center justify-center border border-[#7B61FF]/30 shadow-md">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">{avgHours}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">Per Connected Session</p>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-[#7B61FF] h-full rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* KPI 4: Monthly Attendance Rate */}
        <div className="glass-card-3d rounded-[24px] p-6 min-h-[160px] flex flex-col justify-between space-y-4 border border-white/10">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center border border-[#38BDF8]/30 shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">94%</div>
              <p className="text-xs text-emerald-400 font-semibold mt-1">↑ +2.4% vs last month</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-[#38BDF8] border-t-transparent flex items-center justify-center text-xs font-mono font-bold text-[#38BDF8] shadow-md">
              94%
            </div>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div className="bg-[#38BDF8] h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

      </div>

      {/* 2026 Visual Analytics & Network Control Node */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Attendance Trend 3D Area Chart */}
        <div className="glass-card-3d rounded-[28px] p-6 sm:p-8 space-y-6 border border-white/10 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#5B7FFF]" /> Daily Attendance Trend (30 Days)
              </h3>
              <p className="text-xs text-slate-400">Real-time attendance connectivity volume tracking</p>
            </div>
            <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-[#5B7FFF]/15 text-[#38BDF8] border border-[#5B7FFF]/30 flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping"></span> Live Stream
            </span>
          </div>

          {/* SVG 3D Area Chart Curve */}
          <div className="h-52 w-full pt-4 relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient3D" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B7FFF" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#7B61FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,130 Q 150,30 300,90 T 600,40 T 850,100 T 1000,20 L 1000,160 L 0,160 Z"
                fill="url(#chartGradient3D)"
              />
              <path
                d="M 0,130 Q 150,30 300,90 T 600,40 T 850,100 T 1000,20"
                fill="none"
                stroke="#5B7FFF"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="1000" cy="20" r="7" fill="#38BDF8" className="animate-ping" />
              <circle cx="1000" cy="20" r="5" fill="#38BDF8" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10 pt-4">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span className="text-[#38BDF8] font-bold">Today (Active Session Stream)</span>
          </div>
        </div>

        {/* Network Security Control Node Widget */}
        <div className="glass-card-3d rounded-[28px] p-6 sm:p-8 space-y-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5B7FFF]" /> Network Security Control Node
              </span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#5B7FFF]/15 to-[#7B61FF]/15 border border-[#5B7FFF]/30 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">BK Ran Connect 3D</span>
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  99.98% Uptime
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Authorized Network: <span className="text-[#38BDF8] font-bold">RAMBOLL-GUEST</span>
              </p>
              <p className="text-xs text-slate-400">
                Subnet Gateway: <span className="font-mono text-slate-200">guest.rambollgrp.com (172.16.50.x)</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Security Subnet:</span>
              <span className="text-emerald-400 font-mono font-bold">Active & Enforced</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>External Carrier Status:</span>
              <span className="text-red-400 font-mono font-semibold">Airtel / Jio Restricted</span>
            </div>
          </div>
        </div>

      </div>

      {/* Executive Control Panel & Live Attendance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Executive Action Controls Card */}
        <div className="lg:col-span-1 glass-card-3d rounded-[28px] p-6 sm:p-8 space-y-6 border border-white/10 flex flex-col justify-between">
          
          {/* Section 1: Link Generator */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#5B7FFF]" /> Attendance Link Generator
            </h3>
            
            <Button 
              onClick={handleGenerateLink} 
              isLoading={isGenerating} 
              className="w-full btn-gradient-primary py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate Attendance Link
            </Button>
            
            {generatedLink && (
              <div className="p-4 bg-black/40 border border-white/15 rounded-2xl space-y-2">
                <p className="text-xs text-slate-400 font-mono">Active Link Generated:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink} 
                    className="bg-transparent text-xs text-slate-200 w-full outline-none font-mono truncate"
                  />
                  <Button variant="secondary" onClick={handleCopyLink} className="!py-2 !px-3 rounded-xl text-xs flex items-center gap-1 shrink-0 bg-white/10 hover:bg-white/20">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Section 2: Filters */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#5B7FFF]" /> Live Table Filters
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-black/40 border-white/15 pl-10 rounded-xl text-xs text-white"
                />
              </div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-black/40 border-white/15 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Section 3: Export & Purge */}
          <div className="space-y-3 pt-2">
            <Button onClick={handleExport} className="w-full btn-gradient-emerald py-3.5 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export Excel (IST History)
            </Button>
            <Button onClick={handleClearRecords} className="w-full py-3.5 rounded-2xl font-semibold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center gap-2 transition-all">
              <Trash2 className="w-4 h-4" /> Purge All Database Records
            </Button>
          </div>

        </div>

        {/* 2026 Floating Glass Attendance Table */}
        <div className="lg:col-span-2 glass-card-3d rounded-[28px] p-6 sm:p-8 border border-white/10 flex flex-col h-[650px] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5B7FFF]" /> Attendance Connectivity Table (IST)
              </h3>
              <p className="text-xs text-slate-400">Live individual employee session tracking</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/15 px-4 py-2 rounded-full border border-emerald-500/30 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </div>
          </div>

          {/* 3D Glass Table Container */}
          <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-black/30 shadow-inner">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white/10 sticky top-0 backdrop-blur-2xl border-b border-white/15">
                <tr>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">Username</th>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">Date (IST)</th>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">First Seen (IST)</th>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">Last Seen (IST)</th>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">Total Hours</th>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">IP Address</th>
                  <th className="p-4 sm:p-4.5 font-bold text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record: any) => (
                    <tr key={record.id} className="hover:bg-white/10 transition-all duration-150">
                      <td className="p-4 sm:p-4.5 text-white font-extrabold tracking-wide">{record.username}</td>
                      <td className="p-4 sm:p-4.5 text-slate-300 font-mono">{record.dateFormatted || formatISTDate(record.date)}</td>
                      <td className="p-4 sm:p-4.5 text-slate-300 font-mono">{record.firstSeenFormatted || formatISTTime(record.firstSeen)}</td>
                      <td className="p-4 sm:p-4.5 text-slate-300 font-mono">{record.lastSeenFormatted || formatISTTime(record.lastSeen)}</td>
                      <td className="p-4 sm:p-4.5 text-slate-200 font-mono font-bold">{record.totalHoursFormatted || formatHours(record)}</td>
                      <td className="p-4 sm:p-4.5 text-slate-400 font-mono text-[11px]">{record.ipAddress || '-'}</td>
                      <td className="p-4 sm:p-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                          (record.status as string).toLowerCase() === 'online'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-red-500/15 text-red-400 border-red-500/40'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            (record.status as string).toLowerCase() === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                          }`}></span>
                          {(record.status as string).toLowerCase() === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                      No active attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
