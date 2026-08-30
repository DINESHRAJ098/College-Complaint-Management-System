import { useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import useWorkflowStore from '../store/workflowStore';
import {
  Workflow,
  Play,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';

function MetricCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    COMPLETED: 'bg-green-500/15 text-green-400',
    RUNNING: 'bg-blue-500/15 text-blue-400',
    FAILED: 'bg-red-500/15 text-red-400',
    PENDING: 'bg-yellow-500/15 text-yellow-400',
    RETRYING: 'bg-orange-500/15 text-orange-400',
    PAUSED: 'bg-gray-500/15 text-gray-400',
    CANCELLED: 'bg-gray-500/15 text-gray-400',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || colors.PENDING}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { dashboardStats, fetchDashboard, recentExecutions } = useWorkflowStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = dashboardStats;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Your AI automation command center</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Workflow}
              label="Total Workflows"
              value={stats?.totalWorkflows || 0}
              color="bg-brand-600"
              sub={`${stats?.activeWorkflows || 0} active`}
            />
            <MetricCard
              icon={Play}
              label="Total Executions"
              value={stats?.totalExecutions || 0}
              color="bg-blue-600"
              sub={`${stats?.runningExecutions || 0} running now`}
            />
            <MetricCard
              icon={CheckCircle}
              label="Success Rate"
              value={`${stats?.successRate || 0}%`}
              color="bg-green-600"
              sub={`${stats?.successfulExecutions || 0} completed`}
            />
            <MetricCard
              icon={XCircle}
              label="Failed"
              value={stats?.failedExecutions || 0}
              color="bg-red-600"
            />
          </div>

          {/* Recent Executions */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-white">Recent Executions</h2>
            </div>
            {(!stats?.recentExecutions || stats.recentExecutions.length === 0) ? (
              <p className="text-gray-500 text-sm py-8 text-center">
                No executions yet. Create and run a workflow to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-dark-border">
                      <th className="text-left py-2 font-medium">Workflow</th>
                      <th className="text-left py-2 font-medium">Status</th>
                      <th className="text-left py-2 font-medium">Duration</th>
                      <th className="text-left py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentExecutions.map((exec) => (
                      <tr key={exec._id} className="border-b border-dark-border/50 hover:bg-dark-surface/50">
                        <td className="py-3 text-gray-200">{exec.workflowId?.name || 'Unknown'}</td>
                        <td className="py-3"><StatusBadge status={exec.status} /></td>
                        <td className="py-3 text-gray-400">
                          {exec.duration ? `${(exec.duration / 1000).toFixed(1)}s` : '—'}
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(exec.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/workflows/builder" className="card hover:border-brand-600/30 transition group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600/15 rounded-lg flex items-center justify-center group-hover:bg-brand-600/25 transition">
                  <Zap className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">AI Workflow Builder</div>
                  <div className="text-xs text-gray-400">Generate from a prompt</div>
                </div>
              </div>
            </a>
            <a href="/workflows" className="card hover:border-brand-600/30 transition group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/15 rounded-lg flex items-center justify-center group-hover:bg-blue-600/25 transition">
                  <Workflow className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Manage Workflows</div>
                  <div className="text-xs text-gray-400">View and edit workflows</div>
                </div>
              </div>
            </a>
            <a href="/integrations" className="card hover:border-brand-600/30 transition group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600/15 rounded-lg flex items-center justify-center group-hover:bg-green-600/25 transition">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Connect Integrations</div>
                  <div className="text-xs text-gray-400">OAuth setup for third parties</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
