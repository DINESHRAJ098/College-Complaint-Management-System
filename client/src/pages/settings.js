import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { AppShell } from '../components/Layout/AppShell';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Smartphone,
  Save,
  CheckCircle2,
  Server,
  Building,
  Key
} from 'lucide-react';
import api from '../services/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    batch: user?.batch || ''
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title="Profile & System Settings"
      subtitle="Manage your campus profile, credentials, and notification preferences"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Campus User Identity</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email (Read Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assigned Institutional Role
                </label>
                <input
                  type="text"
                  disabled
                  value={(user?.role || 'student').toUpperCase()}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Batch / Branch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="2023-2027"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* System & Compliance Status */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">System Infrastructure & Compliance Health</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Database Layer</span>
              <span className="font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                MongoDB Connected
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Real-time Event Engine</span>
              <span className="font-bold text-indigo-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Socket.IO Active
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Grievance Compliance</span>
              <span className="font-bold text-purple-400 mt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                AICTE Redressal Norms
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
