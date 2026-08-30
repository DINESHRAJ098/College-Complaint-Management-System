import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import useWorkflowStore from '../../store/workflowStore';
import { Zap, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const examplePrompts = [
  'Send a welcome email to new users when they sign up',
  'When a new row is added to Google Sheets, analyze it with AI and post results to Slack',
  'Invoice over $1000 requires manual approval, under $1000 auto-processes',
  'Monitor a Discord channel for mentions and send email notifications',
  'Every hour, fetch data from an API, transform it, and append to a Google Sheet',
];

export default function BuilderPage() {
  const router = useRouter();
  const { generateWorkflow } = useWorkflowStore();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const workflow = await generateWorkflow(prompt);
      router.push(`/workflows/${workflow._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-sm text-brand-300">AI Workflow Generator</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Describe Your Automation</h1>
            <p className="text-gray-400">
              Tell us what you want to automate in plain English. Our AI will generate a complete workflow graph.
            </p>
          </div>

          {/* Prompt Input */}
          <div className="card">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="input-field min-h-[140px] resize-none text-base leading-relaxed"
              placeholder="e.g., When a new email arrives in Gmail, extract key information with AI, log it to a Google Sheet, and send a Slack notification to the team..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
              }}
            />
            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-dark-surface border border-dark-border rounded text-gray-400">Ctrl+Enter</kbd> to generate
              </span>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="btn-primary flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Generate Workflow
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Try an example</h3>
            <div className="space-y-2">
              {examplePrompts.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left p-3 rounded-lg border border-dark-border bg-dark-card hover:border-brand-600/30 transition text-sm text-gray-300 flex items-center gap-3 group"
                >
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-400 transition flex-shrink-0" />
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
