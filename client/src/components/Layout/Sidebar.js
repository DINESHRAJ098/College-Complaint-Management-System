import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  BarChart3,
  Settings,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'All Complaints', href: '/complaints', icon: FileText },
    { name: 'Lodge Grievance', href: '/complaints/new', icon: PlusCircle },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/complaints' && router.pathname.startsWith('/complaints/') && router.pathname !== '/complaints/new') {
      return true;
    }
    return router.pathname === path;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Emergency & AICTE Helpline Box */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/20 shadow-lg">
            <div className="flex items-center gap-2 text-rose-400 mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Emergency Helplines</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              24/7 Anti-Ragging & Campus Emergency Safety cell.
            </p>
            <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px]">
              <span className="font-mono text-rose-300 font-semibold">1800-180-5522</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">TOLL FREE</span>
            </div>
          </div>

          <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>CampusResolve v1.0</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Online
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
