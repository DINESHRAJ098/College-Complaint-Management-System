import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import useWorkflowStore from '../../store/workflowStore';
import { Plus, Play, Copy, Trash2, Search, Workflow, ExternalLink } from 'lucide-react';

export default function WorkflowsPage() {
  const { workflows, workflowsLoading, fetchWorkflows, deleteWorkflow, duplicateWorkflow, executeWorkflow } =
    useWorkflowStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchWorkflows({ search, status: statusFilter });
  }, [fetchWorkflows, search, statusFilter]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      await deleteWorkflow(id);
    }
  };

  const handleDuplicate = async (id) => {
    await duplicateWorkflow(id);
  };

  const handleExecute = async (id) => {
    await executeWorkflow(id);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Workflows</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your automation workflows</p>
            </div>
            <div className="flex gap-3">
              <Link href="/workflows/builder" className="btn-primary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> AI Generate
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 text-sm"
                placeholder="Search workflows..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field text-sm w-40"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Workflow List */}
          {workflowsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse h-20" />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="card text-center py-12">
              <Workflow className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No workflows yet</p>
              <Link href="/workflows/builder" className="btn-primary text-sm inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Your First Workflow
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {workflows.map((wf) => (
                <div key={wf._id} className="card flex items-center gap-4 hover:border-dark-border/80 transition">
                  <div className="w-10 h-10 bg-brand-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Workflow className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/workflows/${wf._id}`} className="font-medium text-white hover:text-brand-300 transition truncate block">
                      {wf.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {wf.nodes?.length || 0} nodes · v{wf.version} · {wf.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => handleExecute(wf._id)} className="p-2 text-gray-400 hover:text-green-400 transition" title="Execute">
                      <Play className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDuplicate(wf._id)} className="p-2 text-gray-400 hover:text-blue-400 transition" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link href={`/workflows/${wf._id}`} className="p-2 text-gray-400 hover:text-white transition" title="Edit">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(wf._id)} className="p-2 text-gray-400 hover:text-red-400 transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
