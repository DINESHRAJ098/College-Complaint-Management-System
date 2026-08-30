import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import useWorkflowStore from '../../store/workflowStore';
import { Play, Clock, Filter, ChevronRight } from 'lucide-react';

const statusColors = {
  COMPLETED: 'bg-green-500/15 text-green-400',
  RUNNING: 'bg-blue-500/15 text-blue-400',
  FAILED: 'bg-red-500/15 text-red-400',
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  RETRYING: 'bg-orange-500/15 text-orange-400',
  PAUSED: 'bg-gray-500/15 text-gray-400',
  CANCELLED: 'bg-gray-500/15 text-gray-400',
};

export default function ExecutionsPage() {
  const { executions, executionsTotal, executionsLoading, fetchExecutions } = useWorkflowStore();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchExecutions({ page, limit: 15, status: statusFilter });
  }, [fetchExecutions, page, statusFilter]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Executions</h1>
            <p className="text-gray-400 text-sm mt-1">Monitor and manage workflow execution runs</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field text-sm w-40"
            >
              <option value="">All Status</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="text-xs text-gray-500">{executionsTotal} total</span>
          </div>

          {/* Execution List */}
          {executionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse h-16" />
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="card text-center py-12">
              <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No executions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {executions.map((exec) => (
                <Link
                  key={exec._id}
                  href={`/executions/${exec._id}`}
                  className="card flex items-center gap-4 hover:border-dark-border/80 transition group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    exec.status === 'RUNNING' ? 'bg-blue-400 animate-pulse' :
                    exec.status === 'COMPLETED' ? 'bg-green-400' :
                    exec.status === 'FAILED' ? 'bg-red-400' :
                    exec.status === 'PAUSED' ? 'bg-yellow-400' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {exec.workflowId?.name || 'Unknown Workflow'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(exec.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusColors[exec.status] || statusColors.PENDING}`}>
                    {exec.status}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 w-20 justify-end">
                    <Clock className="w-3 h-3" />
                    {exec.duration ? `${(exec.duration / 1000).toFixed(1)}s` : '—'}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {executionsTotal > 15 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={executions.length < 15}
                className="btn-secondary text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
