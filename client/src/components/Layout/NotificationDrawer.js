import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCheck, AlertTriangle, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import Link from 'next/link';

export const NotificationDrawer = ({ isOpen, onClose, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'status_updated':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'escalation':
      case 'sla_warning':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'new_comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-xs text-slate-400">Real-time grievance alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800 flex items-center gap-1 transition"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-slate-400">No notifications yet</p>
              <p className="text-xs text-slate-600 mt-1">
                You'll receive alerts when grievance statuses update or replies arrive.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  n.isRead
                    ? 'bg-slate-850/50 border-slate-800/60 opacity-70 hover:opacity-100'
                    : 'bg-slate-800/90 border-indigo-500/30 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-white truncate">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.complaint && (
                        <Link
                          href={`/complaints/${n.complaint._id || n.complaint}`}
                          onClick={onClose}
                          className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                        >
                          View Ticket →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
