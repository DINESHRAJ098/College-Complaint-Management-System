const executionService = require('../services/executionService');

const emitStart = async (execution) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: null,
    agent: 'monitoring',
    level: 'info',
    message: `Execution started for workflow`,
    metadata: { event: 'execution:start', workflowId: execution.workflowId },
  });
};

const emitNodeStart = async (execution, node) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: node.id,
    agent: 'monitoring',
    level: 'info',
    message: `Node "${node.label || node.id}" started`,
    metadata: { event: 'node:start', nodeType: node.type },
  });
};

const emitNodeComplete = async (execution, node, result) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: node.id,
    agent: 'monitoring',
    level: 'success',
    message: `Node "${node.label || node.id}" completed`,
    metadata: { event: 'node:complete', success: result?.success },
  });
};

const emitNodeFailed = async (execution, node, error) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: node.id,
    agent: 'monitoring',
    level: 'error',
    message: `Node "${node.label || node.id}" failed: ${error}`,
    metadata: { event: 'node:failed', error },
  });
};

const emitComplete = async (execution) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: null,
    agent: 'monitoring',
    level: 'success',
    message: `Execution completed successfully`,
    metadata: { event: 'execution:complete', duration: execution.duration },
  });
};

const emitFailed = async (execution, error) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: null,
    agent: 'monitoring',
    level: 'error',
    message: `Execution failed: ${error}`,
    metadata: { event: 'execution:failed', error },
  });
};

module.exports = { emitStart, emitNodeStart, emitNodeComplete, emitNodeFailed, emitComplete, emitFailed };
