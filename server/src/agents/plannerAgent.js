const executionService = require('../services/executionService');

const plan = async (execution, nodes, edges) => {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const adjacency = new Map();
  const inDegree = new Map();

  nodes.forEach((n) => {
    adjacency.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    if (adjacency.has(e.source)) {
      adjacency.get(e.source).push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const executionOrder = [];
  while (queue.length > 0) {
    const current = queue.shift();
    executionOrder.push(current);
    for (const neighbor of adjacency.get(current) || []) {
      const newDeg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  const confidence = executionOrder.length === nodes.length ? 1.0 : 0.7;

  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: null,
    agent: 'planner',
    level: 'info',
    message: `Planned execution order: ${executionOrder.length} nodes, confidence: ${confidence}`,
    metadata: { executionOrder, confidence, totalNodes: nodes.length },
  });

  return { executionOrder, confidence };
};

module.exports = { plan };
