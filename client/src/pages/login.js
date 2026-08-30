import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Building,
  ShieldAlert,
  Zap,
  Key,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = router.query.redirect || '/dashboard';
      router.push(redirect);
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    } else {
      const redirect = router.query.redirect || '/dashboard';
      router.push(redirect);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    const res = await login(demoEmail, demoPass);
    if (res.success) {
      const redirect = router.query.redirect || '/dashboard';
      router.push(redirect);
    } else {
      setError(res.error || 'Demo login failed');
    }
  };

  const demoAccounts = [
    {
      role: 'Student',
      email: 'student@college.edu',
      desc: 'Lodge grievances, live track, rate satisfaction',
      color: 'border-blue-500/30 hover:border-blue-500 text-blue-400 bg-blue-500/5',
      icon: UserCheck
    },
    {
      role: 'IT Officer / HOD',
      email: 'officer.it@college.edu',
      desc: 'Department queue, assign tech, resolve with proof',
      color: 'border-purple-500/30 hover:border-purple-500 text-purple-400 bg-purple-500/5',
      icon: Building
    },
    {
      role: 'Hostel Warden',
      email: 'officer.hostel@college.edu',
      desc: 'Manage hostel, mess, plumbing & water issues',
      color: 'border-emerald-500/30 hover:border-emerald-500 text-emerald-400 bg-emerald-500/5',
      icon: Building
    },
    {
      role: 'Principal / Admin',
      email: 'admin@college.edu',
      desc: 'College-wide analytics, SLA compliance, audit logs',
      color: 'border-rose-500/30 hover:border-rose-500 text-rose-400 bg-rose-500/5',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-radial-glow">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xl tracking-tight text-white block">
              Campus<span className="text-indigo-400">Resolve</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">College Grievance Redressal</span>
          </div>
        </Link>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter credentials or select a 1-click Demo Role below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick Demo Logins */}
        <div className="mb-6 space-y-2">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ⚡ 1-Click Instant Demo Login
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email, 'password123')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${acc.color} flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{acc.role}</span>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{acc.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Box */}
        <div className="glass-card py-8 px-6 sm:px-8 rounded-2xl shadow-2xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Don't have an account yet? </span>
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
