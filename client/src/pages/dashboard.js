import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { useComplaintStore } from '../store/complaintStore';
import { AppShell } from '../components/Layout/AppShell';
import { StatusBadge, PriorityBadge } from '../components/UI/Badge';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Building,
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, updateRealtimeComplaint } = useComplaintStore();

  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    pending: 0,
    critical: 0,
    escalated: 0,
    resolutionRate: 100,
    avgResolutionHours: 0,
    avgRating: 4.8
  });
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/overview');
      setStats(res.data || {});
    } catch (e) {
      console.warn('Could not fetch overview stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchComplaints();

    const socket = getSocket();
    if (!socket) return;

    const handleCreated = () => {
      fetchStats();
      fetchComplaints();
    };

    const handleUpdated = (c) => {
      updateRealtimeComplaint(c);
      fetchStats();
    };

    socket.on('complaint:created', handleCreated);
    socket.on('complaint:status_updated', handleUpdated);
    socket.on('complaint:list_updated', handleCreated);

    return () => {
      socket.off('complaint:created', handleCreated);
      socket.off('complaint:status_updated', handleUpdated);
      socket.off('complaint:list_updated', handleCreated);
    };
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'in_progress') {
      return ['In Progress', 'Assigned', 'Under Review'].includes(c.status);
    }
    if (activeTab === 'resolved') {
      return c.status === 'Resolved';
    }
    if (activeTab === 'critical') {
      return c.priority === 'Critical' || c.isEscalated;
    }
    return true;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <AppShell
      title={`${getGreeting()}, ${user?.name || 'User'}`}
      subtitle={
        user?.role === 'student'
          ? `Roll: ${user?.studentId || 'CS-2024'} • ${user?.batch || '2023-2027'} • Track and lodge campus grievances`
          : user?.role === 'officer'
          ? `Grievance Officer Console • ${user?.departmentName || 'Department Queue'} • Monitor & Resolve tickets`
          : `College Administration Control Center • AICTE/UGC Compliance Overview`
      }
      action={
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchStats();
              fetchComplaints();
            }}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/complaints/new"
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lodge Grievance</span>
          </Link>
        </div>
      }
    >
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Grievances */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">
              {user?.role === 'student' ? 'My Total Complaints' : 'Total Complaints'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">Lifetime logged</span>
          </div>
        </div>

        {/* In Progress / Under Review */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Active & In Progress</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
              {stats.inProgress + (stats.underReview || 0) + (stats.submitted || 0)}
            </span>
            <span className="text-[11px] text-indigo-300 font-medium">Under Action</span>
          </div>
        </div>

        {/* Resolution Rate % */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Resolution Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats.resolutionRate}%
            </span>
            <span className="text-[11px] text-emerald-300 font-medium">
              {stats.resolved} Resolved
            </span>
          </div>
        </div>

        {/* Satisfaction Score / Critical */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Student Satisfaction</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 flex items-center gap-1">
              {stats.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span>
            </span>
            <span className="text-[11px] text-amber-300 font-medium">Verified ratings</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Filter Tabs & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Grievances ({complaints.length})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'in_progress'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active ({complaints.filter((c) => ['In Progress', 'Assigned', 'Under Review'].includes(c.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'resolved'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved ({complaints.filter((c) => c.status === 'Resolved').length})
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'critical'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              Critical / Urgent ({complaints.filter((c) => c.priority === 'Critical' || c.isEscalated).length})
            </button>
          </div>

          <Link
            href="/complaints"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-end sm:self-auto"
          >
            <span>View Full Directory & Filters</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Complaints Table / List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-slate-400">No grievances found in this category</p>
              <p className="text-xs text-slate-600 mt-1">
                Everything is on track or no tickets match the selected filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredComplaints.map((c) => (
                <Link
                  key={c._id}
                  href={`/complaints/${c._id}`}
                  className="block p-4 sm:p-5 hover:bg-slate-850/80 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {c.ticketNumber}
                        </span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                        {c.isEscalated && (
                          <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-bold border border-rose-500/40 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            ESCALATED
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 ml-auto sm:ml-0">
                          {c.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition truncate">
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {c.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                        {c.location?.roomOrArea && (
                          <span>📍 {c.location.roomOrArea}</span>
                        )}
                        <span>🏢 {c.departmentName}</span>
                        <span>👤 {c.isAnonymous ? 'Anonymous Student' : c.complainantName}</span>
                        <span>⏱️ Logged {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 text-xs">
                      {c.status === 'Resolved' && c.feedback?.rating ? (
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{c.feedback.rating}★ Rated</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 group-hover:text-indigo-300 flex items-center gap-1">
                          <span>View Ticket Details</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
