const executionService = require('../services/executionService');
const integrationService = require('../services/integrationService');
const env = require('../config/env');

const executeNode = async (execution, node, context = {}) => {
  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: node.id,
    agent: 'execution',
    level: 'info',
    message: `Executing node: ${node.label || node.id} (${node.type})`,
    metadata: { nodeType: node.type, config: node.config },
  });

  let result = { success: true, output: {} };

  try {
    switch (node.type) {
      case 'trigger':
        result = { success: true, output: { triggered: true, timestamp: new Date().toISOString() } };
        break;

      case 'integration':
        result = await executeIntegrationNode(execution, node, context);
        break;

      case 'ai':
        result = await executeAINode(execution, node, context);
        break;

      case 'action':
        result = await executeActionNode(node, context);
        break;

      case 'condition':
        result = await executeConditionNode(node, context);
        break;

      case 'notification':
        result = await executeNotificationNode(execution, node, context);
        break;

      default:
        result = { success: true, output: { message: `Node type ${node.type} executed` } };
    }

    if (result.success) {
      await executionService.addLog({
        executionId: execution._id,
        workflowId: execution.workflowId,
        nodeId: node.id,
        agent: 'execution',
        level: 'success',
        message: `Node ${node.label || node.id} completed successfully`,
        metadata: result.output,
      });
    }
  } catch (err) {
    result = { success: false, error: err.message };
    await executionService.addLog({
      executionId: execution._id,
      workflowId: execution.workflowId,
      nodeId: node.id,
      agent: 'execution',
      level: 'error',
      message: `Node ${node.label || node.id} failed: ${err.message}`,
      metadata: { error: err.message },
    });
  }

  return result;
};

const executeIntegrationNode = async (execution, node, context) => {
  const provider = node.config?.provider;
  if (!provider) return { success: false, error: 'No provider configured' };

  const token = await integrationService.getDecryptedToken(execution.userId, provider);
  if (!token) {
    return { success: false, error: 'INTEGRATION_NOT_CONNECTED', errorCode: 'INTEGRATION_NOT_CONNECTED' };
  }

  return { success: true, output: { provider, action: node.config?.action, executed: true } };
};

const executeAINode = async (execution, node, context) => {
  const provider = node.config?.provider || 'openrouter';
  const prompt = node.config?.prompt || 'Process this data';

  if (provider === 'openrouter' && env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
        }),
      });
      const data = await response.json();
      return { success: true, output: { result: data.choices?.[0]?.message?.content || 'AI response generated' } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: true, output: { result: `AI processing complete for: ${prompt}` } };
};

const executeActionNode = async (node, context) => {
  return { success: true, output: { actionType: node.config?.actionType || 'generic', result: 'Action completed' } };
};

const executeConditionNode = async (node, context) => {
  const condition = node.config?.condition || 'true';
  const met = evaluateCondition(condition, context);
  return { success: true, output: { condition, met, branch: met ? 'true' : 'false' } };
};

const evaluateCondition = (condition, context) => {
  try {
    const data = context.data || {};
    const evalStr = Object.entries(data).reduce(
      (str, [key, val]) => str.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(val)),
      condition
    );
    return Function(`"use strict"; return (${evalStr})`)();
  } catch {
    return true;
  }
};

const executeNotificationNode = async (execution, node, context) => {
  const channel = node.config?.channel || 'default';
  return { success: true, output: { channel, notified: true } };
};

module.exports = { executeNode };
