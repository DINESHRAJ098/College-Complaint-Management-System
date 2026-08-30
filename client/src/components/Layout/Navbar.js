import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import {
  Bell,
  LogOut,
  Shield,
  User,
  PlusCircle,
  Sparkles,
  ChevronDown,
  Building,
  Menu,
  X
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

export const Navbar = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdown, setUserDropdown] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      const unread = (res.data || []).filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const socket = getSocket();
    if (!socket) return;

    const handleNew = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNew);
    return () => {
      socket.off('notification:new', handleNew);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-semibold border border-rose-500/30">ADMIN</span>;
      case 'officer':
        return <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-semibold border border-purple-500/30">OFFICER / HOD</span>;
      case 'committee':
        return <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-semibold border border-amber-500/30">GRIEVANCE CELL</span>;
      default:
        return <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-semibold border border-blue-500/30">STUDENT</span>;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition">
                  Campus<span className="text-indigo-400">Resolve</span>
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                  AI CCMS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">College Grievance Redressal Portal</p>
            </div>
          </Link>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Lodge New Complaint CTA */}
          <Link
            href="/complaints/new"
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lodge Grievance</span>
          </Link>

          {/* Notifications Button */}
          <button
            onClick={() => {
              setIsNotifOpen(true);
              setUnreadCount(0);
            }}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600 overflow-hidden flex items-center justify-center text-xs font-semibold text-white">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-medium text-white leading-tight flex items-center gap-1.5">
                    <span>{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-850 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                    {user.studentId && (
                      <p className="text-[10px] text-indigo-400 mt-1 font-mono">Roll: {user.studentId}</p>
                    )}
                  </div>
                  
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        userId={user?.id || user?._id}
      />
    </>
  );
};
