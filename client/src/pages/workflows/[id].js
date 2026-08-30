import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import useWorkflowStore from '../../store/workflowStore';
import {
  Save,
  Play,
  Pause,
  Square,
  GripVertical,
  Zap,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Bot,
  Bell,
  GitBranch,
  Settings,
} from 'lucide-react';

const nodeTypes = {
  trigger: ({ data }) => (
    <div className="bg-dark-card border border-blue-500/30 rounded-lg px-4 py-3 min-w-[120px]">
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
      <div className="text-xs text-blue-400 font-medium mb-1">Trigger</div>
      <div className="text-sm text-white font-medium">{data.label}</div>
    </div>
  ),
  action: ({ data }) => (
    <div className="bg-dark-card border border-green-500/30 rounded-lg px-4 py-3 min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-green-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-green-500 !w-3 !h-3" />
      <div className="text-xs text-green-400 font-medium mb-1">Action</div>
      <div className="text-sm text-white font-medium">{data.label}</div>
    </div>
  ),
  integration: ({ data }) => (
    <div className="bg-dark-card border border-purple-500/30 rounded-lg px-4 py-3 min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3" />
      <div className="text-xs text-purple-400 font-medium mb-1">Integration</div>
      <div className="text-sm text-white font-medium">{data.label}</div>
    </div>
  ),
  ai: ({ data }) => (
    <div className="bg-dark-card border border-yellow-500/30 rounded-lg px-4 py-3 min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-yellow-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-yellow-500 !w-3 !h-3" />
      <div className="text-xs text-yellow-400 font-medium mb-1">AI</div>
      <div className="text-sm text-white font-medium">{data.label}</div>
    </div>
  ),
  condition: ({ data }) => (
    <div className="bg-dark-card border border-orange-500/30 rounded-lg px-4 py-3 min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} className="!bg-green-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} className="!bg-red-500 !w-3 !h-3" />
      <div className="text-xs text-orange-400 font-medium mb-1">Condition</div>
      <div className="text-sm text-white font-medium">{data.label}</div>
    </div>
  ),
  notification: ({ data }) => (
    <div className="bg-dark-card border border-cyan-500/30 rounded-lg px-4 py-3 min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-cyan-500 !w-3 !h-3" />
      <div className="text-xs text-cyan-400 font-medium mb-1">Notification</div>
      <div className="text-sm text-white font-medium">{data.label}</div>
    </div>
  ),
};

const nodeCategories = [
  { type: 'trigger', label: 'Trigger', icon: Zap, color: 'text-blue-400' },
  { type: 'action', label: 'Action', icon: Settings, color: 'text-green-400' },
  { type: 'integration', label: 'Integration', icon: Mail, color: 'text-purple-400' },
  { type: 'ai', label: 'AI Processing', icon: Bot, color: 'text-yellow-400' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: 'text-orange-400' },
  { type: 'notification', label: 'Notification', icon: Bell, color: 'text-cyan-400' },
];

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentWorkflow, fetchWorkflow, updateWorkflow, executeWorkflow } = useWorkflowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (id) fetchWorkflow(id);
  }, [id, fetchWorkflow]);

  useEffect(() => {
    if (currentWorkflow) {
      setNodes(
        (currentWorkflow.nodes || []).map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position || { x: 0, y: 0 },
          data: { label: n.label, config: n.config },
        }))
      );
      setEdges(
        (currentWorkflow.edges || []).map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: e.animated !== false,
          style: { stroke: '#4c6ef5' },
        }))
      );
    }
  }, [currentWorkflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#4c6ef5' } }, eds)
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onCanvasClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = (type) => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      type,
      position: { x: 250, y: (nodes.length + 1) * 150 },
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`, config: {} },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedNodes = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        label: n.data.label,
        position: n.position,
        config: n.data.config || {},
      }));
      const updatedEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        animated: e.animated !== false,
      }));
      await updateWorkflow(id, { nodes: updatedNodes, edges: updatedEdges });
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await executeWorkflow(id);
      router.push('/executions');
    } finally {
      setExecuting(false);
    }
  };

  const handleNodeLabelChange = (label) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label } } : n))
    );
  };

  const handleNodeConfigChange = (key, value) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
          : n
      )
    );
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex gap-4 h-[calc(100vh-7rem)]">
          {/* Node Palette */}
          <div className="w-48 bg-dark-card border border-dark-border rounded-xl p-3 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Nodes</h3>
            <div className="space-y-2">
              {nodeCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    onClick={() => addNode(cat.type)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-dark-surface hover:bg-dark-border transition text-sm text-gray-300"
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 rounded-xl border border-dark-border overflow-hidden relative">
            {/* Toolbar */}
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs flex items-center gap-1">
                <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleExecute}
                disabled={executing || !currentWorkflow}
                className="bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Execute
              </button>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onClick={onCanvasClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-dark-bg"
            >
              <Background color="#1e1e2e" gap={20} />
              <Controls className="!bg-dark-card !border-dark-border" />
            </ReactFlow>
          </div>

          {/* Config Panel */}
          <div className="w-72 bg-dark-card border border-dark-border rounded-xl p-4 flex-shrink-0 overflow-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              {selectedNode ? 'Node Configuration' : 'Workflow Info'}
            </h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Label</label>
                  <input
                    type="text"
                    value={selectedNode.data.label || ''}
                    onChange={(e) => handleNodeLabelChange(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <div className="text-sm text-gray-300 bg-dark-surface px-3 py-2 rounded-lg">{selectedNode.type}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ID</label>
                  <div className="text-xs text-gray-500 bg-dark-surface px-3 py-2 rounded-lg font-mono">{selectedNode.id}</div>
                </div>
                {selectedNode.type === 'integration' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Provider</label>
                    <select
                      value={selectedNode.data.config?.provider || ''}
                      onChange={(e) => handleNodeConfigChange('provider', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="">Select provider</option>
                      <option value="gmail">Gmail</option>
                      <option value="slack">Slack</option>
                      <option value="discord">Discord</option>
                      <option value="google-sheets">Google Sheets</option>
                    </select>
                  </div>
                )}
                {selectedNode.type === 'ai' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Prompt</label>
                    <textarea
                      value={selectedNode.data.config?.prompt || ''}
                      onChange={(e) => handleNodeConfigChange('prompt', e.target.value)}
                      className="input-field text-sm resize-none h-20"
                      placeholder="AI processing instructions..."
                    />
                  </div>
                )}
                {selectedNode.type === 'condition' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Condition</label>
                    <input
                      type="text"
                      value={selectedNode.data.config?.condition || ''}
                      onChange={(e) => handleNodeConfigChange('condition', e.target.value)}
                      className="input-field text-sm font-mono"
                      placeholder="e.g. amount > 1000"
                    />
                  </div>
                )}
                <button
                  onClick={() => {
                    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                    setEdges((eds) =>
                      eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
                    );
                    setSelectedNode(null);
                  }}
                  className="btn-danger text-xs w-full"
                >
                  Delete Node
                </button>
              </div>
            ) : currentWorkflow ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Name</label>
                  <div className="text-sm text-white">{currentWorkflow.name}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <span className="text-xs bg-brand-600/15 text-brand-400 px-2 py-0.5 rounded-full">{currentWorkflow.status}</span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Version</label>
                  <div className="text-sm text-gray-300">v{currentWorkflow.version}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nodes</label>
                  <div className="text-sm text-gray-300">{nodes.length} nodes, {edges.length} edges</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Select a node or load a workflow</p>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
