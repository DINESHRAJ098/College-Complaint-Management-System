import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import useWorkflowStore from '../../store/workflowStore';
import { subscribeExecution, unsubscribeExecution, getSocket } from '../../services/socket';
import {
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Bot,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

const agentColors = {
  planner: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  execution: 'bg-green-500/15 text-green-400 border-green-500/20',
  validation: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  recovery: 'bg-red-500/15 text-red-400 border-red-500/20',
  monitoring: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

const statusIcons = {
  COMPLETED: <CheckCircle className="w-5 h-5 text-green-400" />,
  RUNNING: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
  FAILED: <XCircle className="w-5 h-5 text-red-400" />,
  PENDING: <Clock className="w-5 h-5 text-yellow-400" />,
  RETRYING: <AlertTriangle className="w-5 h-5 text-orange-400" />,
  PAUSED: <Pause className="w-5 h-5 text-gray-400" />,
  CANCELLED: <Square className="w-5 h-5 text-gray-400" />,
};

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const {
    currentExecution,
    executionTimeline,
    fetchExecution,
    fetchTimeline,
    pauseExecution,
    resumeExecution,
    cancelExecution,
  } = useWorkflowStore();

  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    if (id) {
      fetchExecution(id);
      fetchTimeline(id);
      subscribeExecution(id);
    }
    return () => { if (id) unsubscribeExecution(id); };
  }, [id, fetchExecution, fetchTimeline]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleEvent = (event) => {
      setLiveEvents((prev) => [...prev, event]);
    };

    const handleUpdate = (update) => {
      fetchExecution(id);
    };

    socket.on('agent:event', handleEvent);
    socket.on('execution:update', handleUpdate);

    return () => {
      socket.off('agent:event', handleEvent);
      socket.off('execution:update', handleUpdate);
    };
  }, [id, fetchExecution]);

  const exec = currentExecution;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/executions')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {exec?.workflowId?.name || 'Execution Details'}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">Execution ID: {id}</p>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="card flex items-center gap-6">
            <div className="flex items-center gap-3">
              {exec && statusIcons[exec.status]}
              <span className="text-lg font-semibold text-white">{exec?.status || 'Loading...'}</span>
            </div>
            {exec?.duration && (
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> {(exec.duration / 1000).toFixed(1)}s
              </div>
            )}
            <div className="ml-auto flex gap-2">
              {exec?.status === 'RUNNING' && (
                <>
                  <button onClick={() => pauseExecution(id)} className="btn-secondary text-xs flex items-center gap-1">
                    <Pause className="w-3 h-3" /> Pause
                  </button>
                  <button onClick={() => cancelExecution(id)} className="btn-danger text-xs flex items-center gap-1">
                    <Square className="w-3 h-3" /> Cancel
                  </button>
                </>
              )}
              {exec?.status === 'PAUSED' && (
                <button onClick={() => resumeExecution(id)} className="btn-primary text-xs flex items-center gap-1">
                  <Play className="w-3 h-3" /> Resume
                </button>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-3">
              <div className="text-xs text-gray-500">Started</div>
              <div className="text-sm text-gray-300 mt-1">
                {exec?.startTime ? new Date(exec.startTime).toLocaleString() : '—'}
              </div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-gray-500">Ended</div>
              <div className="text-sm text-gray-300 mt-1">
                {exec?.endTime ? new Date(exec.endTime).toLocaleString() : '—'}
              </div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-gray-500">Current Node</div>
              <div className="text-sm text-gray-300 mt-1 font-mono">{exec?.currentNode || '—'}</div>
            </div>
            <div className="card p-3">
              <div className="text-xs text-gray-500">Retries</div>
              <div className="text-sm text-gray-300 mt-1">{exec?.retryCount || 0}</div>
            </div>
          </div>

          {exec?.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="text-sm font-medium text-red-400 mb-1">Error</div>
              <div className="text-sm text-red-300">{exec.error}</div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-gray-400" /> Agent Timeline
            </h2>

            {executionTimeline.length === 0 && liveEvents.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">No timeline events yet</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-auto">
                {[...executionTimeline, ...liveEvents].map((evt, i) => (
                  <div
                    key={evt._id || evt.logId || i}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${agentColors[evt.agent] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-dark-surface">
                      {evt.agent?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase">{evt.agent}</span>
                        {evt.nodeId && (
                          <span className="text-xs text-gray-500 font-mono">{evt.nodeId}</span>
                        )}
                      </div>
                      <div className="text-sm mt-0.5">{evt.message}</div>
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {evt.timestamp || evt.createdAt ? new Date(evt.timestamp || evt.createdAt).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
