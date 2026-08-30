import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'Submitted':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Submitted'
        };
      case 'Under Review':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          label: 'Under Review'
        };
      case 'Assigned':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
          label: 'Assigned'
        };
      case 'In Progress':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400 animate-pulse',
          label: 'In Progress'
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Resolved'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          label: 'Rejected'
        };
      case 'Reopened':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-400 animate-ping',
          label: 'Reopened'
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          label: st || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (pr) => {
    switch (pr) {
      case 'Critical':
        return 'bg-red-500/15 text-red-400 border-red-500/40 shadow-sm shadow-red-500/20';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'Medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      case 'Low':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/40';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityConfig(
        priority
      )}`}
    >
      {priority}
    </span>
  );
};
