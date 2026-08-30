import React, { useState } from 'react';
import { Star, X, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';

export const RatingModal = ({ isOpen, onClose, complaintId, onRatingSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post(`/complaints/${complaintId}/feedback`, {
        rating,
        comment
      });

      // Confetti celebration
      if (rating >= 4) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (onRatingSubmitted) {
        onRatingSubmitted(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Rate Grievance Resolution</h3>
          <p className="text-xs text-slate-400 mt-1">
            How satisfied are you with the action taken by the department?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="text-center text-xs font-semibold text-amber-300">
            {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Outstanding & Swift Resolution!'}
            {rating === 4 && '⭐️⭐️⭐️⭐️ Very Good Resolution'}
            {rating === 3 && '⭐️⭐️⭐️ Acceptable Resolution'}
            {rating === 2 && '⭐️⭐️ Needs Improvement'}
            {rating === 1 && '⭐️ Poor / Unsatisfied'}
          </div>

          {/* Comment Box */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Remarks & Suggestions (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="e.g. Technician arrived on time and replaced the hardware cleanly..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Rating</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
