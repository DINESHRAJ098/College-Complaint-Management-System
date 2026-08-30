import React from 'react';
import { Sparkles, X, CheckSquare, Tag, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export const AICategorizerModal = ({ isOpen, onClose, analysis }) => {
  if (!isOpen || !analysis) return null;

  const {
    suggestedCategory = 'General Grievance',
    suggestedPriority = 'Medium',
    urgencyScore = 50,
    sentiment = 'Neutral',
    keywords = [],
    suggestedChecklist = []
  } = analysis;

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'High':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Medium':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-base">CampusResolve AI Analysis</h3>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                NLP Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Automated Grievance Classification & Action Plan</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Recommended Category</span>
            <span className="text-xs font-bold text-indigo-300">{suggestedCategory}</span>
          </div>

          <div className="p-3 bg-slate-850 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Predicted Urgency Priority</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border inline-block ${getPriorityColor(suggestedPriority)}`}>
              {suggestedPriority} (Score: {urgencyScore}/100)
            </span>
          </div>
        </div>

        {/* Urgency Meter */}
        <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Urgency Gauge</span>
            <span className="font-bold text-white">{urgencyScore}% Criticality</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                urgencyScore >= 80
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : urgencyScore >= 50
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${urgencyScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Routine</span>
            <span>Urgent</span>
            <span>Immediate Emergency</span>
          </div>
        </div>

        {/* Matched Keywords */}
        {keywords.length > 0 && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              Extracted Grievance Keywords
            </span>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="bg-indigo-950/60 text-indigo-300 text-xs px-2.5 py-1 rounded-lg border border-indigo-500/30"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Checklist */}
        <div>
          <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            Suggested Resolution Steps for Grievance Officer
          </span>
          <div className="bg-slate-850 rounded-xl p-3 border border-slate-800 space-y-2">
            {suggestedChecklist.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold font-mono">0{idx + 1}.</span>
                <span className="leading-tight">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
