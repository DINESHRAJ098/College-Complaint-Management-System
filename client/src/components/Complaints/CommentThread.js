import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, MessageSquare, Paperclip, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api';

export const CommentThread = ({ complaintId, comments = [], userRole, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/complaints/${complaintId}/comments`, {
        content: content.trim(),
        isInternalNote: userRole !== 'student' ? isInternalNote : false
      });
      setContent('');
      setIsInternalNote(false);
      if (onCommentAdded) {
        onCommentAdded(res.data);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[480px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Communication & Discussion Thread
            </h3>
            <p className="text-[11px] text-slate-400">Live chat between Complainant & Grievance Cell</p>
          </div>
        </div>
        <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
          {comments.length} Messages
        </span>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <MessageSquare className="w-10 h-10 mb-2 opacity-25" />
            <p className="text-xs font-medium text-slate-400">No discussion notes yet</p>
            <p className="text-[11px] text-slate-600 text-center max-w-xs mt-0.5">
              Use this thread to request additional details, give status updates, or coordinate repairs.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = comment.authorRole === userRole;
            const isInternal = comment.isInternalNote;

            return (
              <div
                key={comment._id}
                className={`flex flex-col ${isInternal ? 'items-center my-2' : isMe ? 'items-end' : 'items-start'}`}
              >
                {isInternal ? (
                  <div className="w-full max-w-lg bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>INTERNAL STAFF NOTE ({comment.authorName})</span>
                      <span className="text-[10px] text-amber-500/80 ml-auto">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{comment.content}</p>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-md ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px]">
                      <span className={`font-semibold ${isMe ? 'text-indigo-200' : 'text-indigo-400'}`}>
                        {comment.authorName}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                          isMe
                            ? 'bg-indigo-700/60 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {comment.authorRole}
                      </span>
                      <span className={`text-[10px] ml-auto ${isMe ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
        {userRole !== 'student' && (
          <div className="flex items-center gap-2 px-1">
            <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
              />
              <Lock className="w-3.5 h-3.5" />
              <span>Mark as Internal Staff Note (Invisible to Student)</span>
            </label>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isInternalNote
                ? 'Type internal investigation note...'
                : 'Type your message or inquiry here...'
            }
            className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
