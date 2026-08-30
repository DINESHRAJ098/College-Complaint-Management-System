import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppShell } from '../../components/Layout/AppShell';
import { AICategorizerModal } from '../../components/Complaints/AICategorizerModal';
import {
  PlusCircle,
  Sparkles,
  Shield,
  Lock,
  Upload,
  AlertTriangle,
  Building,
  MapPin,
  CheckCircle2,
  FileText,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';

export default function NewComplaintPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    departmentId: '',
    isAnonymous: false,
    block: 'Tech Tower A',
    floor: '2nd Floor',
    roomOrArea: ''
  });

  const [departments, setDepartments] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data || []);
      if (res.data?.length > 0) {
        setFormData((prev) => ({ ...prev, departmentId: res.data[0]._id }));
      }
    } catch (e) {
      console.warn('Failed to load departments');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Instant AI Smart Categorizer trigger
  const handleAICategorize = async () => {
    if (!formData.title && !formData.description) {
      setError('Please enter a title or description first to run AI categorization.');
      return;
    }
    setError('');
    try {
      setAnalyzing(true);
      const res = await api.post('/complaints/analyze-prompt', {
        title: formData.title,
        description: formData.description
      });
      setAiAnalysis(res.data);

      // Auto-set category if available
      if (res.data?.suggestedCategory) {
        setFormData((prev) => ({
          ...prev,
          category: res.data.suggestedCategory
        }));
      }

      setIsAiModalOpen(true);
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a complaint title and detailed description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/complaints', {
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined,
        subcategory: formData.subcategory,
        departmentId: formData.departmentId || undefined,
        isAnonymous: formData.isAnonymous,
        location: {
          block: formData.block,
          floor: formData.floor,
          roomOrArea: formData.roomOrArea
        }
      });

      router.push(`/complaints/${res.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to lodge complaint.');
    } finally {
      setSubmitting(false);
    }
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
      title="Lodge New Grievance"
      subtitle="Register an institutional grievance with automated AI classification & SLA tracking"
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grievance Core Details */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Grievance Information</h3>
              </div>

              {/* AI Auto-Categorize Button */}
              <button
                type="button"
                onClick={handleAICategorize}
                disabled={analyzing}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-600/20 transition hover:scale-105 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{analyzing ? 'Scanning...' : 'AI Auto-Detect'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Grievance Title / Summary *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. WiFi router down in Library East Wing study cubicles..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Detailed Description & Impact *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Provide complete context, affected equipment numbers, duration of problem, and safety or academic impact..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Category (Auto-assigned or Manual)
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Auto-Assign via AI</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Responsible College Department
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location & Anonymous Mode */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Campus Location Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Campus Block</label>
                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  placeholder="e.g. Hostel Block B"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Floor Level</label>
                <input
                  type="text"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g. 3rd Floor"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Room / Area</label>
                <input
                  type="text"
                  name="roomOrArea"
                  value={formData.roomOrArea}
                  onChange={handleChange}
                  placeholder="e.g. Room 312 / East Corridor"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Confidential / Anonymous Toggle */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="mt-0.5 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Lodge Anonymously / Confidential Mode</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Your name and roll number will be masked on the ticket and invisible to department technicians.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-850 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Grievance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Modal */}
      <AICategorizerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={aiAnalysis}
      />
    </AppShell>
  );
}
