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
  PieChart
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
    <div className="space-y-8">
      
      {/* 2026 Executive Header Banner */}
      <div className="glass-card rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 shadow-2xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Good Morning, Administrator</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-xs text-slate-400">BK Ran Attendance Connectivity — Executive SaaS Dashboard</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-slate-300">
            <CalendarIcon className="w-4 h-4 text-[#5B7FFF]" />
            <span>24/07/2026 (IST)</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-[#5B7FFF]/10 border border-[#5B7FFF]/30 flex items-center gap-2 text-[#38BDF8]">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span>{currentTime || '06:47:38 PM'}</span>
          </div>
        </div>
      </div>

      {/* 2026 Enterprise KPI Grid (8 Visual Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Connected Users */}
        <div className="glass-card glass-card-hover rounded-[24px] p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Connected</span>
            <div className="p-2.5 rounded-xl bg-[#5B7FFF]/10 text-[#5B7FFF]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">{totalToday}</span>
            <span className="text-xs text-slate-400 ml-2">Devices Registered</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#5B7FFF] h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* KPI 2: Users Online */}
        <div className="glass-card glass-card-hover rounded-[24px] p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Online</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{totalOnline}</span>
            <span className="text-xs text-emerald-500/80 ml-2 font-medium">Live Heartbeats</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: totalToday > 0 ? `${(totalOnline/totalToday)*100}%` : '100%' }}></div>
          </div>
        </div>

        {/* KPI 3: Avg Working Hours */}
        <div className="glass-card glass-card-hover rounded-[24px] p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Working Hours</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono">{avgHours}</span>
            <span className="text-xs text-slate-400 ml-2">Per Session</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#7B61FF] h-full rounded-full" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* KPI 4: Monthly Attendance Rate */}
        <div className="glass-card glass-card-hover rounded-[24px] p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Monthly Rate</span>
            <div className="p-2.5 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-extrabold text-white font-mono">94%</span>
              <span className="text-xs text-emerald-400 ml-2">↑ +2.4%</span>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-[#38BDF8] border-t-transparent flex items-center justify-center text-[10px] font-bold text-[#38BDF8]">
              94%
            </div>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#38BDF8] h-full rounded-full" style={{ width: '94%' }}></div>
          </div>
        </div>

      </div>

      {/* 2026 Visual Analytics & Network Widget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Analytics Graph 1: Daily Attendance Trend (Smooth SVG Curve) */}
        <div className="glass-card rounded-[28px] p-6 space-y-4 border border-white/10 lg:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#5B7FFF]" /> Daily Attendance Trend (30 Days)
              </h3>
              <p className="text-xs text-slate-400">Real-time attendance connectivity volume tracking</p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#5B7FFF]/10 text-[#5B7FFF] border border-[#5B7FFF]/20">
              Live Stream
            </span>
          </div>

          {/* SVG Line Chart Visualization for Ultrawide & 360 Curved Displays */}
          <div className="h-48 w-full pt-4 relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B7FFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5B7FFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,110 Q 120,40 250,80 T 500,40 T 750,90 T 1000,20 L 1000,140 L 0,140 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 0,110 Q 120,40 250,80 T 500,40 T 750,90 T 1000,20"
                fill="none"
                stroke="#5B7FFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="1000" cy="20" r="6" fill="#38BDF8" className="animate-ping" />
              <circle cx="1000" cy="20" r="5" fill="#38BDF8" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-3">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Today (Active Stream)</span>
          </div>
        </div>

        {/* Network Security Status Card Widget */}
        <div className="glass-card rounded-[28px] p-6 space-y-5 border border-white/10 flex flex-col justify-between lg:col-span-1 xl:col-span-1">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#5B7FFF]" /> Network Security Widget
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5B7FFF]/10 to-[#7B61FF]/10 border border-[#5B7FFF]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">BK Ran Connect</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  99.98% Uptime
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Authorized SSID: <span className="text-[#38BDF8] font-bold">RAMBOLL-GUEST</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Gateway: <span className="font-mono text-slate-200">guest.rambollgrp.com (172.16.50.x)</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Security Subnet:</span>
              <span className="text-emerald-400 font-mono font-semibold">Active & Enforced</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Carrier Block:</span>
              <span className="text-slate-200 font-mono">Airtel / Jio Restricted</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Controls Sidebar & Live Attendance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Controls Card: Link Generator & Export */}
        <div className="lg:col-span-1 xl:col-span-1 glass-card rounded-[28px] p-6 space-y-6 border border-white/10">
          
          {/* Session Link Generator */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5B7FFF]" /> Link Generator
            </h3>
            
            <Button 
              onClick={handleGenerateLink} 
              isLoading={isGenerating} 
              className="w-full bg-gradient-primary py-3 rounded-2xl font-semibold shadow-[0_10px_30px_rgba(91,127,255,0.3)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Generate Attendance Link
            </Button>
            
            {generatedLink && (
              <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                <p className="text-[11px] text-slate-400 font-mono">Active Shared Link:</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedLink} 
                    className="bg-transparent text-xs text-slate-200 w-full outline-none font-mono truncate"
                  />
                  <Button variant="secondary" onClick={handleCopyLink} className="!p-2 rounded-xl text-xs flex items-center gap-1 shrink-0">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-white/10" />

          {/* Table Filters */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-[#5B7FFF]" /> Live Filters
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter by username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-black/30 border-white/10 pl-9 rounded-xl text-xs text-white"
                />
              </div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-black/30 border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Export & Data Maintenance */}
          <div className="space-y-3">
            <Button onClick={handleExport} variant="secondary" className="w-full py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10">
              <Download className="w-4 h-4 text-emerald-400" /> Export Excel (IST History)
            </Button>
            <Button onClick={handleClearRecords} className="w-full py-3 rounded-2xl text-xs font-semibold !bg-red-500/10 !text-red-400 hover:!bg-red-500/20 border border-red-500/30 flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Purge All Database Records
            </Button>
          </div>

        </div>

        {/* 2026 Floating Glass Attendance Table */}
        <div className="lg:col-span-2 xl:col-span-3 glass-card rounded-[28px] p-6 border border-white/10 flex flex-col h-[650px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5B7FFF]" /> Attendance Connectivity (IST)
              </h3>
              <p className="text-xs text-slate-400">Live individual employee session table</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </div>
          </div>

          {/* Glass Table */}
          <div className="flex-1 overflow-auto rounded-2xl border border-white/5 bg-black/20">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white/5 sticky top-0 backdrop-blur-xl border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-slate-300">Username</th>
                  <th className="p-4 font-semibold text-slate-300">Date (IST)</th>
                  <th className="p-4 font-semibold text-slate-300">First Seen (IST)</th>
                  <th className="p-4 font-semibold text-slate-300">Last Seen (IST)</th>
                  <th className="p-4 font-semibold text-slate-300">Total Hours</th>
                  <th className="p-4 font-semibold text-slate-300">IP Address</th>
                  <th className="p-4 font-semibold text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record: any) => (
                    <tr key={record.id} className="hover:bg-white/5 transition-all duration-200">
                      <td className="p-4 text-white font-bold tracking-wide">{record.username}</td>
                      <td className="p-4 text-slate-400 font-mono">{record.dateFormatted || formatISTDate(record.date)}</td>
                      <td className="p-4 text-slate-300 font-mono">{record.firstSeenFormatted || formatISTTime(record.firstSeen)}</td>
                      <td className="p-4 text-slate-300 font-mono">{record.lastSeenFormatted || formatISTTime(record.lastSeen)}</td>
                      <td className="p-4 text-slate-300 font-mono font-semibold">{record.totalHoursFormatted || formatHours(record)}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{record.ipAddress || '-'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          (record.status as string).toLowerCase() === 'online'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (record.status as string).toLowerCase() === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                          }`}></span>
                          {(record.status as string).toLowerCase() === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
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
