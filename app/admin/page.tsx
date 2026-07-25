"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { 
  Users, UserCheck, Clock, Sparkles, Copy, Check, Download, 
  Trash2, Search, Calendar as CalendarIcon, ShieldCheck, Zap,
  Activity, Wifi, RefreshCw, ArrowUpRight, ArrowDownRight
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
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/attendance');
        if (res.ok) { setRecords(await res.json()); }
      } catch (e) { console.error("Failed to fetch attendance data"); }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => { clearInterval(interval); clearInterval(timeInterval); };
  }, []);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/sessions', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const prodOrigin = typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
          ? 'https://network-attendance-tracking.vercel.app' : window.location.origin;
        setGeneratedLink(`${prodOrigin}/join/${data.code}`);
      }
    } catch (e) { console.error("Failed to generate link"); }
    finally { setIsGenerating(false); }
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
    try { return new Date(isoString).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return isoString.split('T')[0]; }
  };

  const formatISTTime = (isoString: string) => {
    if (!isoString) return '-';
    try { return new Date(isoString).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); }
    catch { return isoString; }
  };

  const formatHours = (record: any) => {
    if (record.totalMinutes !== undefined && record.totalMinutes !== null) {
      return `${(record.totalMinutes / 60).toFixed(1)} hrs`;
    }
    return record.totalHours || '0.0 hrs';
  };

  const totalOnline = records.filter(r => (r.status as string).toLowerCase() === 'online').length;
  const totalToday = records.length;
  const avgHours = records.length > 0 
    ? (records.reduce((acc, r: any) => acc + (r.totalMinutes || 0), 0) / records.length / 60).toFixed(1) 
    : "0.0";

  const filteredRecords = records.filter(record => 
    record.username.toLowerCase().includes(search.toLowerCase()) &&
    (dateFilter === '' || record.date === dateFilter)
  );

  const handleClearRecords = async () => {
    if (!confirm('Are you sure you want to clear all attendance records? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/attendance', { method: 'DELETE' });
      if (res.ok) { setRecords([]); }
    } catch (e) { console.error(e); }
  };

  const kpis = [
    { label: 'Active Users', value: totalToday, suffix: '', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', trend: '+3', up: true },
    { label: 'Online Now', value: totalOnline, suffix: '', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: 'Live', up: true },
    { label: "Today's Sessions", value: totalToday, suffix: '', icon: UserCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', trend: '+2', up: true },
    { label: 'Avg Hours', value: avgHours, suffix: ' hrs', icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', trend: '', up: true },
    { label: 'Network Health', value: '99.9', suffix: '%', icon: Wifi, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', trend: 'Stable', up: true },
    { label: 'Connection Quality', value: 'Strong', suffix: '', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: '✓', up: true },
  ];

  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operational Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">{currentDate || 'Loading...'} · {currentTime || '--:--:--'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.06 }}
              className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between min-h-[130px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} ${kpi.border} border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white font-mono tracking-tight">{kpi.value}{kpi.suffix}</span>
                {kpi.trend && (
                  <span className={`ml-2 text-[11px] font-semibold ${kpi.up ? 'text-emerald-400' : 'text-red-400'} inline-flex items-center gap-0.5`}>
                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions + Network Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 space-y-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button onClick={handleGenerateLink} isLoading={isGenerating}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Generate Link
            </Button>
            <Button onClick={handleExport}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Export Excel
            </Button>
            <Button onClick={handleClearRecords}
              className="w-full py-3 rounded-xl font-semibold text-sm text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear Records
            </Button>
          </div>

          {generatedLink && (
            <div className="p-4 bg-black/30 border border-white/10 rounded-xl space-y-2 animate-fade-in">
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Generated Attendance Link</p>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={generatedLink}
                  className="bg-transparent text-xs text-slate-200 w-full outline-none font-mono truncate" />
                <button onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all shrink-0">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Filter by username..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all sm:w-48" />
          </div>
        </motion.div>

        {/* Network Health Widget */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-panel rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Network Health
          </h3>

          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">BK Ran Connect</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Authorized SSID:</span>
                <span className="text-cyan-400 font-mono font-bold">RAMBOLL-GUEST</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Gateway:</span>
                <span className="text-slate-200 font-mono">guest.rambollgrp.com</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Heartbeat:</span>
                <span className="text-emerald-400 font-mono font-bold">Active (30s)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Carrier Block:</span>
                <span className="text-red-400 font-mono">Airtel / Jio Restricted</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>Online Users</span>
            <span className="text-emerald-400 font-bold">{totalOnline} active</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: totalToday > 0 ? `${(totalOnline/totalToday)*100}%` : '100%' }}></div>
          </div>
        </motion.div>
      </div>

      {/* Live Attendance Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
        className="glass-panel rounded-2xl p-6 border border-white/8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Live Attendance Table (IST)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time employee session tracking · Auto-refreshes every 3s</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: 'pulse-dot 2s infinite' }} />
            Live Sync
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-white/8 bg-black/20 max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 sticky top-0 backdrop-blur-xl border-b border-white/10">
              <tr>
                {['Username','Date (IST)','First Seen','Last Seen','Total Hours','IP Address','Status'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-slate-300 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length > 0 ? filteredRecords.map((record: any) => (
                <tr key={record.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-4 py-3 text-white font-semibold">{record.username}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono">{record.dateFormatted || formatISTDate(record.date)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{record.firstSeenFormatted || formatISTTime(record.firstSeen)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{record.lastSeenFormatted || formatISTTime(record.lastSeen)}</td>
                  <td className="px-4 py-3 text-slate-200 font-mono font-semibold">{record.totalHoursFormatted || formatHours(record)}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{record.ipAddress || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      (record.status as string).toLowerCase() === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        (record.status as string).toLowerCase() === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`} style={(record.status as string).toLowerCase() === 'online' ? { animation: 'pulse-dot 2s infinite' } : {}}></span>
                      {(record.status as string).toLowerCase() === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500">No attendance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
