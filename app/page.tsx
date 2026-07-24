"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aurora-bg min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-[28px] p-8 space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-white/10">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5B7FFF] to-[#7B61FF] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(91,127,255,0.4)]">
              <ShieldCheck className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              BK Ran Group
            </h1>
            <p className="text-xs text-slate-400 font-medium">BK Ran Attendance Connectivity — Admin Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter admin username"
              className="bg-black/30 border-white/10 text-white"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="bg-black/30 border-white/10 text-white"
            />
            
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-primary py-3 rounded-xl font-semibold shadow-[0_10px_30px_rgba(91,127,255,0.3)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2" isLoading={isLoading}>
              <Lock className="w-4 h-4" /> Sign In to Executive Dashboard
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
