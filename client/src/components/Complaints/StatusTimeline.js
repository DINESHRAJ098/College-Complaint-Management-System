import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const StatusTimeline = ({ timeline = [], currentStatus }) => {
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Under Review':
        return <UserCheck className="w-4 h-4 text-amber-400" />;
      case 'Assigned':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'In Progress':
        return <Wrench className="w-4 h-4 text-indigo-400" />;
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Feedback Received':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'Reopened':
        return <RotateCcw className="w-4 h-4 text-orange-400" />;
      case 'Escalated':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActorBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'officer':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'committee':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Dot/Icon */}
            <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
              {getTimelineIcon(event.status)}
            </div>

            {/* Content Box */}
            <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {event.status}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${getActorBadge(
                      event.actorRole
                    )}`}
                  >
                    {event.actorName || event.actorRole}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(event.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {event.note && (
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
