import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { AppShell } from '../../components/Layout/AppShell';
import { StatusBadge, PriorityBadge } from '../../components/UI/Badge';
import {
  FileText,
  Search,
  Filter,
  Download,
  PlusCircle,
  RotateCcw,
  ArrowUpRight,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Building,
  CheckCircle2
} from 'lucide-react';

export default function ComplaintsListPage() {
  const { user } = useAuthStore();
  const {
    complaints,
    pagination,
    filters,
    setFilters,
    resetFilters,
    fetchComplaints,
    fetchDepartments,
    departments,
    isLoading
  } = useComplaintStore();

  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    fetchDepartments();
    fetchComplaints(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
  };

  const handleExportCSV = () => {
    if (!complaints.length) return;
    const headers = ['Ticket Number', 'Title', 'Category', 'Priority', 'Status', 'Department', 'Complainant', 'Date'];
    const rows = complaints.map((c) => [
      c.ticketNumber,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.departmentName}"`,
      c.isAnonymous ? 'Anonymous' : c.complainantName,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_grievance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoriesList = [
    'Hostel & Mess',
    'Academic & Faculty',
    'Infrastructure & Civil',
    'Electrical & Maintenance',
    'IT & Labs',
    'Library & Resources',
    'Anti-Ragging & Harassment',
    'Fee & Accounts',
    'Sanitation & Hygiene',
    'General Grievance'
  ];

  return (
    <AppShell
      title="Grievance Directory"
      subtitle="Search, filter, and audit institutional complaint records"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <Link
            href="/complaints/new"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lodge Grievance</span>
          </Link>
        </div>
      }
    >
      {/* Search & Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by ticket ID (e.g. CMP-2026-1001), keyword, title, or room location..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Reopened">Reopened</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearchInput('');
              resetFilters();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Complaint List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Fetching complaint records...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-slate-400">No complaints matching query</p>
            <p className="text-xs text-slate-600 mt-1">Try relaxing your search terms or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {complaints.map((c) => (
              <Link
                key={c._id}
                href={`/complaints/${c._id}`}
                className="block p-4 sm:p-5 hover:bg-slate-850/80 transition group"
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
                      <span className="text-[11px] text-slate-400 ml-auto sm:ml-0">{c.category}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition truncate">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      {c.location?.roomOrArea && <span>📍 {c.location.roomOrArea}</span>}
                      <span>🏢 {c.departmentName}</span>
                      <span>👤 {c.isAnonymous ? 'Anonymous' : c.complainantName}</span>
                      <span>⏱️ {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-xs text-slate-400 group-hover:text-indigo-300 gap-1 self-end sm:self-center">
                    <span>Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchComplaints(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-800 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchComplaints(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-800 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
