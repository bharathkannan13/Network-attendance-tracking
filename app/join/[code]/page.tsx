"use client";

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Wifi, AlertTriangle, Link2Off, Sparkles, CheckCircle2 } from 'lucide-react';

type PortalState = 'LOADING' | 'USERNAME_FORM' | 'WELCOME' | 'ACCESS_DENIED' | 'INVALID';

export default function EmployeePortal({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [state, setState] = useState<PortalState>('LOADING');
  const [username, setUsername] = useState('');
  const [deviceUuid, setDeviceUuid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let uuid = localStorage.getItem('ramboll_device_uuid');
    if (!uuid) {
      uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('ramboll_device_uuid', uuid);
    }
    setDeviceUuid(uuid);

    const savedUser = localStorage.getItem('ramboll_employee_username');
    if (savedUser) {
      setUsername(savedUser);
    }

    const validateCode = async () => {
      try {
        const netRes = await fetch('/api/network/check');
        if (netRes.status === 403) {
          setState('ACCESS_DENIED');
          return;
        }

        const res = await fetch(`/api/sessions/validate?code=${code}`);
        if (res.ok) {
          if (savedUser) {
            sendHeartbeatPayload(savedUser, uuid);
          } else {
            setState('USERNAME_FORM');
          }
        } else {
          if (code && code.length >= 4) {
            if (savedUser) {
              sendHeartbeatPayload(savedUser, uuid);
            } else {
              setState('USERNAME_FORM');
            }
          } else {
            setState('INVALID');
          }
        }
      } catch {
        if (code && code.length >= 4) {
          setState('USERNAME_FORM');
        } else {
          setState('INVALID');
        }
      }
    };
    validateCode();
  }, [code]);

  const sendHeartbeatPayload = async (uname: string, uuidStr: string) => {
    try {
      const res = await fetch('/api/attendance/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, username: uname, deviceUuid: uuidStr }),
      });
      if (res.ok) {
        setState('WELCOME');
      } else {
        setState('ACCESS_DENIED');
      }
    } catch {
      setState('ACCESS_DENIED');
    }
  };

  useEffect(() => {
    if (state !== 'WELCOME' || !username) return;

    const interval = setInterval(() => {
      sendHeartbeatPayload(username, deviceUuid);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [state, code, username, deviceUuid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    const trimmedUser = username.trim();
    localStorage.setItem('ramboll_employee_username', trimmedUser);
    
    setIsSubmitting(true);
    try {
      await sendHeartbeatPayload(trimmedUser, deviceUuid);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center p-6 relative">
      {state === 'LOADING' && (
        <div className="text-center space-y-4 relative z-10">
          <div className="w-12 h-12 border-4 border-[#5B7FFF] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(91,127,255,0.4)]"></div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Connecting to BK Ran Group Network...</p>
        </div>
      )}

      {state === 'USERNAME_FORM' && (
        <div className="w-full max-w-md relative z-10">
          <div className="glass-card rounded-[28px] p-8 space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/10">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5B7FFF]/20 to-[#7B61FF]/20 border border-[#5B7FFF]/30 flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-7 h-7 text-[#5B7FFF]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                BK Ran Group Network
              </h1>
              <p className="text-xs text-slate-400">Enter your credentials to activate attendance connectivity</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <Input
                label="Employee Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. bhat or Sha"
                required
                autoFocus
                className="bg-black/30 border-white/10 focus:border-[#5B7FFF] text-white"
              />
              <Button type="submit" className="w-full bg-gradient-primary py-3 rounded-xl font-semibold shadow-[0_10px_30px_rgba(91,127,255,0.3)] transition-all hover:scale-[1.02]" isLoading={isSubmitting}>
                Connect to Network
              </Button>
            </form>
          </div>
        </div>
      )}

      {state === 'WELCOME' && (
        <div className="w-full max-w-lg relative z-10">
          <div className="glass-card rounded-[28px] p-10 text-center space-y-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto relative">
              <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse-green flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to BK Ran Group Network</h1>
              <h2 className="text-xl font-semibold text-[#5B7FFF]">Hello, {username}</h2>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Attendance Connectivity Active
            </div>
            
            <div className="space-y-3 bg-white/[0.02] p-6 rounded-2xl border border-white/5 text-slate-300 text-sm">
              <p className="flex items-center justify-center gap-2 font-medium text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Connected Successfully
              </p>
              <p className="text-xs text-slate-400">Please keep this page open while working.</p>

              <div className="pt-3 border-t border-white/5">
                <span className="text-[11px] text-slate-400 block mb-1 font-mono uppercase tracking-wider">Network Security Key:</span>
                <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#5B7FFF]/10 py-1.5 px-3 rounded-lg border border-[#5B7FFF]/20 inline-block">
                  RAMBOLL-GUEST (guest.rambollgrp.com)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {state === 'ACCESS_DENIED' && (
        <div className="w-full max-w-md relative z-10">
          <div className="glass-card rounded-[28px] p-8 text-center space-y-5 border border-red-500/30 shadow-[0_30px_70px_rgba(255,95,109,0.15)]">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-red-400 tracking-tight">Invalid Network Connection</h1>
            <p className="text-slate-300 text-sm">You are connected to an unauthorized network (Airtel, Jio, or External Carrier).</p>
            <div className="bg-white/[0.03] p-4 rounded-xl border border-red-500/20 text-xs">
              <p className="text-slate-400 mb-1">Required Authorized Corporate Network:</p>
              <p className="font-mono text-[#38BDF8] font-bold text-sm">RAMBOLL-GUEST (guest.rambollgrp.com)</p>
            </div>
          </div>
        </div>
      )}

      {state === 'INVALID' && (
        <div className="w-full max-w-md relative z-10">
          <div className="glass-card rounded-[28px] p-8 text-center space-y-4 border border-white/10">
            <Link2Off className="w-12 h-12 text-slate-500 mx-auto" />
            <h1 className="text-xl font-bold text-white">Invalid Link</h1>
            <p className="text-slate-400 text-sm">This attendance link is invalid or has expired.</p>
          </div>
        </div>
      )}
    </div>
  );
}
