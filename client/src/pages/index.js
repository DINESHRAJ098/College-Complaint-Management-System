import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Shield,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building,
  UserCheck,
  Zap,
  Lock,
  Headphones,
  FileText,
  Star,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [trackId, setTrackId] = useState('');
  const [trackError, setTrackError] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackId.trim()) {
      setTrackError('Please enter a ticket number');
      return;
    }
    // Forward to complaints list or login
    router.push(`/login?redirect=/complaints&track=${encodeURIComponent(trackId.trim())}`);
  };

  const portalCards = [
    {
      title: 'Student Grievance Cell',
      desc: 'Submit complaints on Hostel, Academics, Labs, Infrastructure, or Mess with photo evidence and live progress tracking.',
      icon: UserCheck,
      color: 'from-blue-600/20 to-indigo-600/20 border-indigo-500/30 text-indigo-400',
      action: 'Lodge Grievance',
      href: '/login'
    },
    {
      title: 'Anti-Ragging & Safety Committee',
      desc: 'Zero-tolerance confidential reporting mechanism with immediate 24-hour committee intervention and emergency squad dispatch.',
      icon: ShieldAlert,
      color: 'from-rose-600/20 to-red-600/20 border-rose-500/30 text-rose-400',
      action: 'Report Confidentially',
      href: '/login'
    },
    {
      title: 'Department Officers & HODs',
      desc: 'Work order assignment queue, technician dispatch management, SLA countdown timers, and resolution auditing.',
      icon: Building,
      color: 'from-purple-600/20 to-violet-600/20 border-purple-500/30 text-purple-400',
      action: 'Officer Console',
      href: '/login'
    },
    {
      title: 'Administrative Governance',
      desc: 'College-wide analytics, department resolution leaderboards, AICTE/UGC accreditation compliance reports, and SLA monitoring.',
      icon: Zap,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
      action: 'Admin Access',
      href: '/login'
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI Smart Categorization',
      desc: 'NLP scanner auto-detects grievance urgency, assigns target department, and provides technicians with diagnostic checklists.'
    },
    {
      icon: Clock,
      title: 'Strict SLA Tracking',
      desc: 'Enforced turnaround targets (12h for emergency safety, 24h for IT/Hostel). Auto-escalation to Principal upon breach.'
    },
    {
      icon: Lock,
      title: '100% Confidential Mode',
      desc: 'Submit sensitive complaints anonymously while still engaging in secure real-time two-way communication.'
    },
    {
      icon: Star,
      title: 'Student Satisfaction Rating',
      desc: 'Students rate resolved complaints from 1-5 stars. Unsatisfied resolutions can be reopened with one click.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">
                Campus<span className="text-indigo-400">Resolve</span>
              </span>
              <span className="ml-2 bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>Access System</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial-glow">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AICTE & UGC Compliant Grievance Redressal Mechanism</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Empowering Campus Voice. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Swift, Transparent Resolution.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The all-in-one institutional grievance redressal system for students, faculty, and administration. 
            AI-driven auto categorization, real-time status updates, SLA governance, and verified action proof.
          </p>

          {/* Quick Track Box */}
          <div className="max-w-xl mx-auto pt-4">
            <form
              onSubmit={handleTrackSubmit}
              className="glass-card p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value);
                    setTrackError('');
                  }}
                  placeholder="Enter Ticket ID (e.g. CMP-2026-1001)..."
                  className="w-full bg-transparent py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5"
              >
                <span>Track Status</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
            {trackError && <p className="text-xs text-rose-400 mt-2">{trackError}</p>}
            <p className="text-[11px] text-slate-400 mt-2">
              Demo Tickets to try: <span className="font-mono text-indigo-300">CMP-2026-1001</span> (WiFi), <span className="font-mono text-indigo-300">CMP-2026-1002</span> (Water Cooler)
            </p>
          </div>
        </div>
      </section>

      {/* Portal Cards Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Institutional Portals & Grievance Desks
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Select your relevant institutional division to proceed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {portalCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.02] transition-transform"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} border flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group"
                  >
                    <span>{card.action}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why CampusResolve Outperforms Traditional Suggestion Boxes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Next-generation accountability, SLA enforcement, and closed-loop verification
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Helpline Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Campus Safety & Anti-Ragging Cell</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Under Immediate Distress or Facing Ragging?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Report instantly through confidential reporting or reach our 24/7 designated grievance counselor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:18001805522"
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Call 1800-180-5522</span>
            </a>
            <Link
              href="/login"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-3 rounded-xl border border-slate-700 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Anonymous Report</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">CampusResolve CCMS</span>
            <span>— Institutional Grievance Redressal System</span>
          </div>
          <div>
            Built with Next.js, Express, MongoDB & Socket.IO • AICTE/UGC Guidelines Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
