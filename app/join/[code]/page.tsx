"use client";

import { useState, useEffect, use } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
        // Perform Initial Network Scan
        const netRes = await fetch('/api/network/check');
        if (netRes.status === 403) {
          setState('ACCESS_DENIED');
          return;
        }

        const res = await fetch(`/api/sessions/validate?code=${code}`);
        if (res.ok) {
          if (savedUser) {
            // Auto-connect returning user on page refresh
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e1a]">
      {state === 'LOADING' && (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0087b3] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400">Validating session...</p>
        </div>
      )}

      {state === 'USERNAME_FORM' && (
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              RAMBoll Attendance
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Enter Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdoe"
              required
              autoFocus
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Enter
            </Button>
          </form>
        </Card>
      )}

      {state === 'WELCOME' && (
        <Card className="w-full max-w-lg text-center bg-black/40 border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse-green"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to RAMBoll Attendance Portal</h1>
          <h2 className="text-xl text-emerald-400 mb-6">Welcome, {username}</h2>
          
          <div className="space-y-4 text-gray-300 bg-white/5 p-6 rounded-lg border border-white/5">
            <p className="flex items-center justify-center gap-2 font-medium text-white">
              <span>✅</span> Attendance Started Successfully
            </p>
            <p>You are connected to the authorized network.</p>
            <p className="text-sm text-emerald-400 bg-emerald-500/10 py-2 px-4 rounded-md inline-block">
              Please keep this page open while working.
            </p>
            <div className="pt-2">
              <span className="text-xs text-gray-400 block mb-1">Network Security Key:</span>
              <span className="text-xs font-mono font-bold text-[#00f0ff] bg-[#0087b3]/20 py-1.5 px-3 rounded border border-[#0087b3]/30 inline-block">
                RAMBOLL-GUEST (guest.rambollgrp.com)
              </span>
            </div>
          </div>
        </Card>
      )}

      {state === 'ACCESS_DENIED' && (
        <Card className="w-full max-w-md text-center bg-black/40 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Network Connection</h1>
          <p className="text-gray-300 text-sm mb-4">You are connected to an unauthorized network (Airtel, Jio, or External Carrier).</p>
          <div className="bg-white/5 p-4 rounded-lg border border-red-500/20 mt-4">
            <p className="text-xs text-gray-400">Required Authorized Corporate Network:</p>
            <p className="font-mono text-[#00f0ff] font-bold text-sm mt-1">RAMBOLL-GUEST (guest.rambollgrp.com)</p>
          </div>
        </Card>
      )}

      {state === 'INVALID' && (
        <Card className="w-full max-w-md text-center bg-black/40">
          <div className="text-5xl mb-6 opacity-50">🔗</div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-gray-400">This attendance link is invalid or has expired.</p>
        </Card>
      )}
    </div>
  );
}
