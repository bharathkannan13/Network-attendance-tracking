"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, Clock, Users, UserCheck, Activity,
  Wifi, Calendar, ArrowUpRight, PieChart, Timer
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

export default function AnalyticsDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/attendance');
        if (res.ok) { setRecords(await res.json()); }
      } catch (e) { console.error("Failed to fetch data"); }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalOnline = records.filter(r => (r.status as string).toLowerCase() === 'online').length;
  const totalToday = records.length;
  const avgHours = records.length > 0 
    ? (records.reduce((acc, r: any) => acc + (r.totalMinutes || 0), 0) / records.length / 60).toFixed(1) 
    : "0.0";

  const execKpis = [
    { label: 'Monthly Attendance Rate', value: '94', suffix: '%', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Avg Working Hours', value: avgHours, suffix: ' hrs', icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Total Sessions', value: totalToday.toString(), suffix: '', icon: UserCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Network Uptime', value: '99.9', suffix: '%', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Attendance Success', value: '98.7', suffix: '%', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Online', value: totalOnline.toString(), suffix: '', icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  // User leaderboard data
  const userStats = records.reduce((acc: Record<string, number>, r: any) => {
    const mins = r.totalMinutes || 0;
    acc[r.username] = (acc[r.username] || 0) + mins;
    return acc;
  }, {});
  const leaderboard = Object.entries(userStats)
    .map(([name, mins]) => ({ name, hours: (mins / 60).toFixed(1) }))
    .sort((a, b) => parseFloat(b.hours) - parseFloat(a.hours))
    .slice(0, 10);

  return (
    <div className="space-y-8 w-full">
      
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Detailed attendance metrics, network analytics, and employee insights</p>
      </motion.div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {execKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}
              className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-white font-mono">{kpi.value}{kpi.suffix}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1: Attendance Trend + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Attendance Trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" /> Daily Attendance Trend
              </h3>
              <p className="text-xs text-slate-400">Last 7 days attendance volume</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">7D</span>
          </div>
          <div className="h-48 w-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 700 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,120 Q 100,80 200,100 T 400,50 T 600,70 T 700,30 L 700,160 L 0,160 Z" fill="url(#trendFill)" />
              <path d="M 0,120 Q 100,80 200,100 T 400,50 T 600,70 T 700,30" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="700" cy="30" r="4" fill="#818CF8" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-white/5 pt-3">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span className="text-indigo-400 font-bold">Today</span>
          </div>
        </motion.div>

        {/* Attendance Distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-indigo-400" /> Attendance Distribution
            </h3>
            <p className="text-xs text-slate-400">Proportional user presence overview</p>
          </div>
          <div className="flex items-center justify-center py-6">
            <svg width="130" height="130" viewBox="0 0 120 120" className="drop-shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="25" strokeLinecap="round" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#F59E0B" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226" strokeLinecap="round" transform="rotate(234 60 60)" />
              <text x="60" y="58" textAnchor="middle" className="fill-white text-xl font-bold" style={{fontSize: '20px', fontWeight: 800}}>90%</text>
              <text x="60" y="73" textAnchor="middle" className="fill-slate-400 font-medium" style={{fontSize: '10px'}}>Present</text>
            </svg>
          </div>
          <div className="space-y-2.5 max-w-[240px] mx-auto w-full border-t border-white/5 pt-4">
            {[
              { label: 'Present', pct: '90%', color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Late', pct: '7%', color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Absent', pct: '3%', color: 'bg-slate-400', text: 'text-slate-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2.5 text-slate-300">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                  {item.label}
                </span>
                <span className={`font-mono ${item.text}`}>{item.pct}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2: Weekly Hours + User Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Working Hours */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
          className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-400" /> Weekly Working Hours
          </h3>
          <div className="space-y-4 max-w-[650px] mx-auto w-full">
            {['Mon','Tue','Wed','Thu','Fri'].map((day, i) => {
              const widths = [75, 85, 60, 90, 70];
              return (
                <div key={day} className="flex items-center gap-4">
                  <span className="text-xs font-mono font-bold text-slate-400 w-8">{day}</span>
                  <div className="flex-1 bg-white/5 h-7 rounded-lg overflow-hidden border border-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${widths[i]}%` }} transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-lg flex items-center justify-end pr-3">
                      <span className="text-[11px] font-mono text-white font-bold">{(widths[i] / 10).toFixed(1)}h</span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Connected Users Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Top Connected Users
          </h3>
          <div className="max-w-[650px] mx-auto w-full space-y-2.5">
            {leaderboard.length > 0 ? (
              leaderboard.map((user, i) => (
                <div key={user.name} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : i === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : i === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-slate-400 border border-white/5'
                  }`}>{i + 1}</span>
                  <span className="text-xs font-bold text-slate-200 flex-1">{user.name}</span>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{user.hours} hrs</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No user data available yet.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Network Analytics Section */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}
        className="glass-panel rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Wifi className="w-4 h-4 text-indigo-400" /> Network Analytics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Network Uptime', value: '99.98%', sub: '30-day avg', color: 'text-emerald-400' },
            { label: 'Connected Devices', value: totalToday.toString(), sub: 'Today', color: 'text-indigo-400' },
            { label: 'Connection Stability', value: '98.2%', sub: 'No drops', color: 'text-cyan-400' },
            { label: 'Avg Session', value: avgHours + 'h', sub: 'Per user', color: 'text-violet-400' },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center space-y-1">
              <span className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</span>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-[10px] text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
