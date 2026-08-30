import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { User, Shield, Key, Activity, Moon, Sun } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await api.get('/health');
        setHealth(data);
      } catch {
        setHealth({ status: 'error' });
      }
    };
    checkHealth();
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-3xl">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your account and platform settings</p>
          </div>

          {/* Profile */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-white">Profile</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-dark-border">
                <span className="text-sm text-gray-400">Name</span>
                <span className="text-sm text-white">{user?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-border">
                <span className="text-sm text-gray-400">Email</span>
                <span className="text-sm text-white">{user?.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400">Last Login</span>
                <span className="text-sm text-gray-300">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-white">Access Control</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-dark-border">
                <span className="text-sm text-gray-400">Role</span>
                <span className="text-xs bg-brand-600/15 text-brand-400 px-2.5 py-1 rounded-full font-medium uppercase">
                  {user?.role || 'operator'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400">Permissions</span>
                <span className="text-sm text-gray-300">
                  {user?.role === 'admin' ? 'Full platform access' : 'Operator access — workflows and executions'}
                </span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-white">System Health</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-dark-border">
                <span className="text-sm text-gray-400">Server Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  health?.status === 'ok' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {health?.status === 'ok' ? 'Operational' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-border">
                <span className="text-sm text-gray-400">LangGraph</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  health?.langGraph === 'available' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {health?.langGraph || 'unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400">Server Time</span>
                <span className="text-sm text-gray-300">
                  {health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-white">Appearance</h2>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-400">Dark Mode</span>
              <button
                onClick={toggleTheme}
                className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-brand-600' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
