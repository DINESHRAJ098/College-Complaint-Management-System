import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { AppShell } from '../../components/Layout/AppShell';
import { StatusBadge, PriorityBadge } from '../../components/UI/Badge';
import { StatusTimeline } from '../../components/Complaints/StatusTimeline';
import { CommentThread } from '../../components/Complaints/CommentThread';
import { RatingModal } from '../../components/Complaints/RatingModal';
import { AICategorizerModal } from '../../components/Complaints/AICategorizerModal';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
  MapPin,
  Sparkles,
  Star,
  RotateCcw,
  ShieldAlert,
  Send,
  EyeOff,
  User,
  CheckSquare,
  Wrench,
  FileCheck,
  ChevronLeft
} from 'lucide-react';
import api from '../../services/api';
import { getSocket, joinComplaintRoom, leaveComplaintRoom } from '../../services/socket';

export default function ComplaintDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();

  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Action States
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
      setComments(res.comments || []);
    } catch (err) {
      setError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
      joinComplaintRoom(id);
    }

    const socket = getSocket();
    if (!socket) return;

    const handleStatusUpdated = (updated) => {
      if (updated._id === id) {
        setComplaint(updated);
      }
    };

    const handleCommentAdded = (comment) => {
      setComments((prev) => [...prev, comment]);
    };

    socket.on('complaint:status_updated', handleStatusUpdated);
    socket.on('complaint:comment_added', handleCommentAdded);

    return () => {
      leaveComplaintRoom(id);
      socket.off('complaint:status_updated', handleStatusUpdated);
      socket.off('complaint:comment_added', handleCommentAdded);
    };
  }, [id]);

  // Actions
  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: statusUpdateNote || `Status updated to ${newStatus}`
      });
      setComplaint(res.data);
      setStatusUpdateNote('');
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.patch(`/complaints/${id}/resolve`, {
        notes: resolutionNotes
      });
      setComplaint(res.data);
      setShowResolveForm(false);
      setResolutionNotes('');
    } catch (err) {
      alert(err.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/complaints/${id}/reopen`, {
        reason: reopenReason
      });
      setComplaint(res.data);
      setShowReopenForm(false);
      setReopenReason('');
    } catch (err) {
      alert(err.message || 'Failed to reopen complaint');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post(`/complaints/${id}/escalate`, {
        reason: escalateReason || 'SLA timeline exceeded without satisfactory resolution'
      });
      setComplaint(res.data);
      setShowEscalateForm(false);
      setEscalateReason('');
    } catch (err) {
      alert(err.message || 'Failed to escalate complaint');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading grievance ticket...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !complaint) {
    return (
      <AppShell>
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-1">Ticket Not Found or Access Denied</h2>
          <p className="text-xs text-slate-400 mb-4">{error || 'This grievance record does not exist.'}</p>
          <button
            onClick={() => router.push('/complaints')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Back to Directory
          </button>
        </div>
      </AppShell>
    );
  }

  const isComplainant = user?.id === complaint.complainant?._id || user?.id === complaint.complainant;
  const isOfficerOrAdmin = ['officer', 'admin', 'committee'].includes(user?.role);

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-indigo-400">{complaint.ticketNumber}</span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          {complaint.isEscalated && (
            <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-bold border border-rose-500/40 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              ESCALATED
            </span>
          )}
        </div>
      }
      subtitle={`Lodged on ${new Date(complaint.createdAt).toLocaleDateString()} • ${complaint.category}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details, Actions, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Complaint Overview */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {complaint.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              {complaint.description}
            </p>

            {/* Location Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {complaint.location?.block || 'Main Campus'} • {complaint.location?.floor || 'Ground'} •{' '}
                  {complaint.location?.roomOrArea || 'General Area'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-800 text-slate-300">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>{complaint.departmentName}</span>
              </span>

              {/* AI Badge Trigger */}
              {complaint.aiAnalysis && (
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Diagnostics ({complaint.aiAnalysis.urgencyScore}% urgency)</span>
                </button>
              )}
            </div>
          </div>

          {/* Resolution Proof Box (if resolved) */}
          {complaint.status === 'Resolved' && complaint.resolution && (
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Official Resolution Proof & Action Record</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {new Date(complaint.resolution.resolvedAt).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/20">
                {complaint.resolution.notes || 'Issue repaired and checked.'}
              </p>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Resolved by: <strong className="text-white">{complaint.resolution.resolvedByName || 'Officer'}</strong></span>
                
                {/* Student Rating prompt */}
                {isComplainant && !complaint.feedback?.rating && (
                  <button
                    onClick={() => setIsRatingOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Rate Resolution</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Feedback Display (if student rated) */}
          {complaint.feedback?.rating && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>Student Feedback: {complaint.feedback.rating}/5 Stars</span>
                </div>
                {complaint.feedback.comment && (
                  <p className="text-slate-300 italic">"{complaint.feedback.comment}"</p>
                )}
              </div>
              <span className="text-[10px] text-amber-400 font-mono">
                {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Officer Action Panel */}
          {isOfficerOrAdmin && (
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-400" />
                <span>Grievance Officer Action Console</span>
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus('In Progress')}
                    disabled={actionLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                  >
                    Mark In Progress
                  </button>
                )}

                {complaint.status !== 'Under Review' && complaint.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus('Under Review')}
                    disabled={actionLoading}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                  >
                    Set Under Review
                  </button>
                )}

                {complaint.status !== 'Resolved' && (
                  <button
                    onClick={() => setShowResolveForm(!showResolveForm)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}

                {!complaint.isEscalated && complaint.status !== 'Resolved' && (
                  <button
                    onClick={() => setShowEscalateForm(!showEscalateForm)}
                    className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Escalate to Committee</span>
                  </button>
                )}
              </div>

              {/* Resolve Form Dropdown */}
              {showResolveForm && (
                <form onSubmit={handleResolve} className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2.5">
                  <label className="block text-xs font-semibold text-emerald-400">
                    Resolution Notes & Action Description
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe specific repair/action taken (e.g. Cisco AP unit replaced, cable crimped and tested for 300 Mbps speed)..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResolveForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading || !resolutionNotes.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow"
                    >
                      Submit Official Resolution
                    </button>
                  </div>
                </form>
              )}

              {/* Escalate Form */}
              {showEscalateForm && (
                <form onSubmit={handleEscalate} className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-rose-500/30 space-y-2.5">
                  <label className="block text-xs font-semibold text-rose-400">
                    Escalation Reason for Grievance Redressal Committee / Principal
                  </label>
                  <input
                    type="text"
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="e.g. Turnaround target exceeded / Requires institutional budget approval..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEscalateForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow"
                    >
                      Confirm Committee Escalation
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Student Reopen option if resolved */}
          {isComplainant && complaint.status === 'Resolved' && (
            <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Unsatisfied with this Resolution?</h4>
                <p className="text-[11px] text-slate-400">You can reopen the ticket with additional comments.</p>
              </div>
              <button
                onClick={() => setShowReopenForm(!showReopenForm)}
                className="bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Ticket</span>
              </button>
            </div>
          )}

          {showReopenForm && (
            <form onSubmit={handleReopen} className="p-4 rounded-2xl bg-slate-900 border border-orange-500/30 space-y-2.5">
              <label className="block text-xs font-semibold text-orange-400">
                Reason for Reopening Grievance
              </label>
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={2}
                placeholder="Explain why the issue remains unresolved or has recurred..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReopenForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !reopenReason.trim()}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
                >
                  Reopen Grievance
                </button>
              </div>
            </form>
          )}

          {/* Real-time Discussion Thread */}
          <CommentThread
            complaintId={complaint._id}
            comments={comments}
            userRole={user?.role || 'student'}
            onCommentAdded={(newComment) => setComments((prev) => [...prev, newComment])}
          />
        </div>

        {/* Right Column: Metadata, SLA, Timeline */}
        <div className="space-y-6">
          {/* SLA Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Turnaround SLA</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Target SLA Resolution Deadline</span>
              <span className="text-xs font-bold text-white font-mono">
                {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : 'Within 48 hours'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Compliant with College Redressal Norms</span>
            </div>
          </div>

          {/* Stakeholders Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">
              Stakeholders & Authority
            </h3>

            {/* Department */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Department Responsible</span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <Building className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="font-semibold text-white">{complaint.departmentName}</p>
                  <p className="text-[10px] text-slate-500">{complaint.department?.code || 'DEPT'}</p>
                </div>
              </div>
            </div>

            {/* Assigned Officer */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Assigned Grievance Officer</span>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="font-semibold text-white">{complaint.assignedOfficerName || 'Assigned to HOD'}</p>
                  <p className="text-[10px] text-slate-500">Department Authority</p>
                </div>
              </div>
            </div>

            {/* Complainant Identity */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Complainant Information</span>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                {complaint.isAnonymous ? (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <EyeOff className="w-4 h-4" />
                    <div>
                      <p className="font-semibold text-white">Confidential / Anonymous</p>
                      <p className="text-[10px] text-slate-500">Identity protected by institutional policy</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="font-semibold text-white">{complaint.complainantName}</p>
                      {complaint.complainantRollNo && (
                        <p className="text-[10px] text-slate-500 font-mono">Roll: {complaint.complainantRollNo}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visual Audit Timeline */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center justify-between">
              <span>Grievance Audit Trail</span>
              <span className="text-[10px] text-slate-500 font-mono">{complaint.timeline?.length || 0} events</span>
            </h3>
            <StatusTimeline timeline={complaint.timeline || []} currentStatus={complaint.status} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        complaintId={complaint._id}
        onRatingSubmitted={(updated) => setComplaint(updated)}
      />

      <AICategorizerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={complaint.aiAnalysis}
      />
    </AppShell>
  );
}
