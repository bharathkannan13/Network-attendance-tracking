"use client";
import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Wifi, CheckCircle2, AlertTriangle, Link2Off, ShieldCheck, Laptop, Smartphone } from 'lucide-react';

type PortalState = 'LOADING' | 'USERNAME_FORM' | 'WELCOME' | 'ACCESS_DENIED' | 'INVALID' | 'MOBILE_RESTRICTED';

export default function EmployeePortal({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [state, setState] = useState<PortalState>('LOADING');
  const [username, setUsername] = useState('');
  const [deviceUuid, setDeviceUuid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if the user is visiting on a Mobile Phone or Tablet device
    const isMobileOrTablet = () => {
      const ua = navigator.userAgent;
      const isMobileOS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isIPad = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
      return isMobileOS || isIPad;
    };

    if (isMobileOrTablet()) {
      setState('MOBILE_RESTRICTED');
      return;
    }

    let uuid = localStorage.getItem('ramboll_device_uuid');
    if (!uuid) {
      uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('ramboll_device_uuid', uuid);
    }
    setDeviceUuid(uuid);
    const savedUser = localStorage.getItem('ramboll_employee_username');
    if (savedUser) { setUsername(savedUser); }
    const validateCode = async () => {
      try {
        const netRes = await fetch('/api/network/check');
        if (netRes.status === 403) { setState('ACCESS_DENIED'); return; }
        const res = await fetch(`/api/sessions/validate?code=${code}`);
        if (res.ok) {
          if (savedUser) { sendHeartbeatPayload(savedUser, uuid); } else { setState('USERNAME_FORM'); }
        } else {
          if (code && code.length >= 4) {
            if (savedUser) { sendHeartbeatPayload(savedUser, uuid); } else { setState('USERNAME_FORM'); }
          } else { setState('INVALID'); }
        }
      } catch {
        if (code && code.length >= 4) { setState('USERNAME_FORM'); } else { setState('INVALID'); }
      }
    };
    validateCode();
  }, [code]);

  const sendHeartbeatPayload = async (uname: string, uuidStr: string) => {
    try {
      const res = await fetch('/api/attendance/heartbeat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, username: uname, deviceUuid: uuidStr }),
      });
      if (res.ok) { setState('WELCOME'); } else { setState('ACCESS_DENIED'); }
    } catch { setState('ACCESS_DENIED'); }
  };

  useEffect(() => {
    if (state !== 'WELCOME' || !username) return;
    const interval = setInterval(() => { sendHeartbeatPayload(username, deviceUuid); }, 30000);
    return () => clearInterval(interval);
  }, [state, code, username, deviceUuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    const trimmedUser = username.trim();
    localStorage.setItem('ramboll_employee_username', trimmedUser);
    setIsSubmitting(true);
    try { await sendHeartbeatPayload(trimmedUser, deviceUuid); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {state === 'LOADING' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Connecting to BK Ran Group Network...</p>
          </motion.div>
        )}

        {state === 'USERNAME_FORM' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-indigo-500/20">
                  <Wifi className="w-7 h-7 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">BK Ran Group Network</h1>
                <p className="text-sm text-slate-400">Enter credentials to activate attendance</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="Employee Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    disabled={isSubmitting}
                    required
                    className="bg-slate-950/50 border-slate-800 focus:border-indigo-500 text-slate-200 h-12 rounded-xl px-4"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all border-0"
                >
                  {isSubmitting ? 'Connecting...' : 'Connect to Network'}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {state === 'WELCOME' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
            <Card className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <CheckCircle2 className="w-8 h-8 text-emerald-500 relative z-10" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome to BK Ran Group Network</h1>
              <p className="text-slate-300 mb-6">Hello, {username}</p>
              
              <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-emerald-400 font-medium text-sm">BK Ran Attendance Connectivity Active</span>
                </div>
                <p className="text-slate-400 text-sm">Status: Connected Successfully</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
                <ShieldCheck className="w-4 h-4" />
                <span>Network: RAMBOLL-GUEST (guest.rambollgrp.com)</span>
              </div>

              <p className="text-sm text-slate-400">Please keep this page open while working.</p>
            </Card>
          </motion.div>
        )}

        {state === 'ACCESS_DENIED' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-rose-500/20">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Invalid Network Connection</h1>
              <p className="text-slate-400 text-sm mb-6">
                You are trying to mark attendance from an unauthorized network.
              </p>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-rose-500/20 text-left">
                <p className="text-xs text-rose-400 font-medium mb-1">Required Network:</p>
                <p className="text-sm text-slate-300">RAMBOLL-GUEST (guest.rambollgrp.com)</p>
              </div>
            </Card>
          </motion.div>
        )}

        {state === 'INVALID' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
            <Card className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <Link2Off className="w-8 h-8 text-slate-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
              <p className="text-slate-400 text-sm">
                This attendance link is invalid, malformed, or has expired.
              </p>
            </Card>
          </motion.div>
        )}

        {state === 'MOBILE_RESTRICTED' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-amber-500/20">
                <Laptop className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Desktop Access Required</h1>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                This attendance link can only be accessed from a **laptop** or **desktop computer**.
              </p>
              <div className="bg-slate-950/50 rounded-xl p-4 border border-amber-500/10 text-left flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-normal">
                  Access is restricted on mobile devices and tablets. Please open this link on your main workstation or laptop.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
