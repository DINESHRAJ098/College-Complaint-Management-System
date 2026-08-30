import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Zap,
  Bot,
  Workflow,
  Shield,
  ArrowRight,
  Play,
  Plug,
  Activity,
  Layers,
  Brain,
  RefreshCw,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Generation',
    description: 'Describe your automation in plain English and watch it materialize as a visual workflow graph.',
  },
  {
    icon: Bot,
    title: 'Multi-Agent Orchestration',
    description: 'Five specialized AI agents collaborate to plan, execute, validate, recover, and monitor every workflow.',
  },
  {
    icon: Workflow,
    title: 'Visual Workflow Canvas',
    description: 'Drag-and-drop React Flow canvas for building and editing complex automation pipelines.',
  },
  {
    icon: Plug,
    title: 'Real Integrations',
    description: 'Connect Gmail, Slack, Discord, and Google Sheets with secure OAuth credentials.',
  },
  {
    icon: Activity,
    title: 'Real-Time Streaming',
    description: 'Watch agent events stream live as your workflows execute through the orchestration engine.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT auth, encrypted credentials, rate limiting, and comprehensive audit trails.',
  },
];

const agents = [
  { name: 'Planner', color: 'from-blue-500 to-cyan-400', desc: 'Decides node ordering with confidence scoring' },
  { name: 'Execution', color: 'from-green-500 to-emerald-400', desc: 'Runs each node against integrations & AI' },
  { name: 'Validation', color: 'from-yellow-500 to-orange-400', desc: 'Verifies required outputs after execution' },
  { name: 'Recovery', color: 'from-red-500 to-pink-400', desc: 'Classifies failures and decides retry vs escalation' },
  { name: 'Monitoring', color: 'from-purple-500 to-violet-400', desc: 'Emits timeline events for full audit trail' },
];

export default function LandingPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) router.replace('/dashboard');
  }, [token, router]);

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Nav */}
      <nav className="border-b border-dark-border bg-dark-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Agentflow AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white text-sm font-medium transition">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-1.5 mb-8">
            <Zap className="w-4 h-4 text-brand-400" />
            <span className="text-sm text-brand-300">Multi-Agent AI Automation Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Automate Anything
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">
              With AI Agents
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Describe your workflow in natural language. Our five-agent orchestration chain plans, executes,
            validates, recovers, and monitors every step — giving you a modern operations console powered by AI.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-primary text-base px-8 py-3 flex items-center gap-2"
            >
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="btn-secondary text-base px-8 py-3 flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Agent Chain Visualization */}
      <section className="py-20 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Five Agents, One Execution Chain</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every workflow runs through a fixed chain of cooperating AI agents. Each one adds intelligence and resilience.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {agents.map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-3">
                <div className={`bg-gradient-to-r ${agent.color} rounded-xl p-[1px]`}>
                  <div className="bg-dark-card rounded-xl p-5 text-center w-40">
                    <Layers className="w-6 h-6 text-white mx-auto mb-2" />
                    <div className="text-sm font-bold text-white">{agent.name}</div>
                    <div className="text-[11px] text-gray-400 mt-1 leading-tight">{agent.desc}</div>
                  </div>
                </div>
                {i < agents.length - 1 && (
                  <RefreshCw className="w-4 h-4 text-gray-600 hidden md:block mt-4 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-gray-400">From prompt to production-ready automation in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="card hover:border-brand-600/30 transition-all duration-300 group">
                  <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-600/20 transition">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-dark-border">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Automate?</h2>
          <p className="text-gray-400 mb-8">
            Join the next generation of operations automation. Describe, build, and execute — all with AI.
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-3 inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 text-center text-sm text-gray-500">
        <p>Agentflow AI — Agentic Automation Platform</p>
      </footer>
    </div>
  );
}
