import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard,
  Workflow,
  Play,
  Plug,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useWorkflowStore from '../store/workflowStore';
import { connectSocket, disconnectSocket } from '../services/socket';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
  { href: '/workflows/builder', label: 'AI Builder', icon: Zap },
  { href: '/executions', label: 'Executions', icon: Play },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { notifications, fetchNotifications, addNotification } = useWorkflowStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      connectSocket(user.id);
      fetchNotifications();
    }
    return () => disconnectSocket();
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    const { getSocket } = require('../services/socket');
    const socket = getSocket();
    if (socket) {
      socket.on('notification:new', (notif) => addNotification(notif));
    }
    return () => {
      if (socket) socket.off('notification:new');
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-dark-card border-r border-dark-border flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="p-4 flex items-center gap-3 border-b border-dark-border">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg text-white whitespace-nowrap">Agentflow</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-400 hover:text-white transition"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-dark-surface'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-border">
          {sidebarOpen && user && (
            <div className="text-sm text-gray-400 mb-3">
              <div className="font-medium text-gray-200">{user.name}</div>
              <div className="text-xs">{user.email}</div>
            </div>
          )}
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-dark-card border-b border-dark-border flex items-center px-6 flex-shrink-0">
          <h1 className="text-sm font-medium text-gray-400">Agentflow AI</h1>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative text-gray-400 hover:text-white transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {/* Notifications drawer */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNotifOpen(false)} />
          <div className="relative w-96 bg-dark-card border-l border-dark-border h-full overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">Notifications</h2>
              <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 rounded-lg border ${
                      n.isRead ? 'bg-dark-surface border-dark-border' : 'bg-brand-600/10 border-brand-600/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          n.type === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : n.type === 'failure'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {n.type}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-200">{n.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
