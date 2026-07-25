"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Users, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Search, 
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  Zap
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
      
      {/* Executive Clean Header Banner */}
      <div className="glass-card-3d rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white glow-text-blue">
              BK Ran Attendance Connectivity
            </h2>
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse-ring shrink-0"></span>
          </div>
          <p className="text-sm text-slate-400 font-medium">Executive Admin Portal & Live Session Manager</p>
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

      {/* Main Grid: Essential Control Panel & Live Attendance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Essential Action Controls Card */}
        <div className="lg:col-span-1 glass-card-3d rounded-[28px] p-6 sm:p-8 space-y-6 border border-white/10 flex flex-col justify-between">
          
          {/* Section 1: Link Generator */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#5B7FFF]" /> Link Generator
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
                <p className="text-xs text-slate-400 font-mono">Active Shared Link:</p>
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

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-slate-400 block mb-1">Authorized Network Key:</span>
              <span className="font-mono font-bold text-[#38BDF8] bg-[#5B7FFF]/10 px-2.5 py-1 rounded-md border border-[#5B7FFF]/20 inline-block">
                RAMBOLL-GUEST (guest.rambollgrp.com)
              </span>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Section 2: Table Filters */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#5B7FFF]" /> Search & Filters
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

          {/* Section 3: Excel Export & Data Management */}
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
        <div className="lg:col-span-2 glass-card-3d rounded-[28px] p-6 sm:p-8 border border-white/10 flex flex-col h-[700px] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5B7FFF]" /> Live Attendance Connectivity Table (IST)
              </h3>
              <p className="text-xs text-slate-400">Real-time individual employee session tracking</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/15 px-4 py-2 rounded-full border border-emerald-500/30 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </div>
          </div>

          {/* Clean Glass Table Container */}
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
