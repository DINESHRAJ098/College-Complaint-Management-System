import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/Layout/AppShell';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Shield,
  Layers
} from 'lucide-react';
import api from '../services/api';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data || []);
    } catch (e) {
      console.warn('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  return (
    <AppShell
      title="College Departments & Grievance Desks"
      subtitle="Administrative units, responsible officers, SLA turnarounds, and resolution track records"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => {
          const stats = dept.stats || { total: 0, resolved: 0, inProgress: 0, resolutionRate: 100 };

          return (
            <div
              key={dept._id}
              className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                      style={{ backgroundColor: dept.color || '#4F46E5' }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                        {dept.code}
                      </span>
                      <h3 className="font-bold text-white text-sm leading-tight">{dept.name}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{dept.description}</p>

                {/* Categories Covered */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Categories Covered
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.categories?.map((cat, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-slate-200">HOD: {dept.headOfficerName || 'Assigned Officer'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{dept.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Default SLA: <strong className="text-white">{dept.defaultSlaHours} Hours</strong></span>
                  </div>
                  {dept.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="font-mono text-[11px]">{dept.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Stats Bar */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Resolution Rate</span>
                  <span className="font-bold text-emerald-400">{stats.resolutionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stats.resolutionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{stats.total} Total Grievances</span>
                  <span>{stats.resolved} Resolved</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
