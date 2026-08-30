const executionService = require('../services/executionService');
const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

let langGraphAvailable = false;
try {
  require('@langchain/community');
  langGraphAvailable = true;
} catch {
  langGraphAvailable = false;
}

const run = async (executionId) => {
  const execution = await executionService.updateStatus(executionId, 'RUNNING');
  const { workflowSnapshot, inputs } = execution;

  await monitoringAgent.emitStart(execution);

  try {
    const nodes = workflowSnapshot.nodes || [];
    const edges = workflowSnapshot.edges || [];

    const { executionOrder, confidence } = await plannerAgent.plan(execution, nodes, edges);

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const context = { data: inputs, results: {} };

    let allPassed = true;

    for (const nodeId of executionOrder) {
      const currentExec = await executionService.getById(execution.userId, executionId);
      if (currentExec.status === 'PAUSED') {
        await monitoringAgent.emitNodeStart(execution, { id: nodeId, label: 'Paused', type: 'pause' });
        return { status: 'PAUSED' };
      }
      if (currentExec.status === 'CANCELLED') {
        return { status: 'CANCELLED' };
      }

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      await executionService.updateStatus(executionId, 'RUNNING', { currentNode: nodeId });
      await monitoringAgent.emitNodeStart(execution, node);

      let result = await executionAgent.executeNode(execution, node, context);
      const validation = await validationAgent.validate(execution, node, result);

      if (!result.success || !validation.valid) {
        await monitoringAgent.emitNodeFailed(execution, node, result.error || validation.issues.join(', '));
        const recovery = await recoveryAgent.recover(
          execution,
          node,
          result.error || validation.issues.join(', '),
          execution.retryCount
        );

        if (recovery.action === 'retry_with_backoff') {
          await executionService.updateStatus(executionId, 'RETRYING', { currentNode: nodeId });
          result = await executionAgent.executeNode(execution, node, context);
          if (!result.success) {
            allPassed = false;
            await monitoringAgent.emitNodeFailed(execution, node, result.error);
          }
        } else {
          allPassed = false;
        }
      } else {
        await monitoringAgent.emitNodeComplete(execution, node, result);
      }

      context.results[nodeId] = result?.output;
    }

    if (allPassed) {
      await executionService.updateStatus(executionId, 'COMPLETED', { outputs: context.results });
      await monitoringAgent.emitComplete(execution);
      await executionService.createNotification({
        userId: execution.userId,
        workflowId: execution.workflowId,
        executionId,
        type: 'success',
        title: 'Execution Completed',
        message: `Workflow executed successfully`,
      });
    } else {
      await executionService.updateStatus(executionId, 'FAILED', { error: 'One or more nodes failed' });
      await monitoringAgent.emitFailed(execution, 'One or more nodes failed');
      await executionService.createNotification({
        userId: execution.userId,
        workflowId: execution.workflowId,
        executionId,
        type: 'failure',
        title: 'Execution Failed',
        message: 'One or more nodes failed during execution',
      });
    }
  } catch (err) {
    await executionService.updateStatus(executionId, 'FAILED', { error: err.message });
    await monitoringAgent.emitFailed(execution, err.message);
    await executionService.createNotification({
      userId: execution.userId,
      workflowId: execution.workflowId,
      executionId,
      type: 'failure',
      title: 'Execution Failed',
      message: err.message,
    });
  }

  const finalExec = await executionService.getById(execution.userId, executionId);
  return { status: finalExec.status, executionId };
};

module.exports = { run, langGraphAvailable };
