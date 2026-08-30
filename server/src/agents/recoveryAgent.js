const executionService = require('../services/executionService');

const FAILURE_TYPES = {
  MISSING_FIELDS: { retryable: true, strategy: 'retry_with_backoff' },
  API_FAILURE: { retryable: true, strategy: 'retry_with_backoff' },
  AUTH_EXPIRED: { retryable: false, strategy: 'escalate' },
  RATE_LIMIT: { retryable: true, strategy: 'retry_with_backoff' },
  TRANSIENT: { retryable: true, strategy: 'retry_with_backoff' },
  UNKNOWN: { retryable: true, strategy: 'retry_with_backoff' },
};

const classify = (error) => {
  if (!error) return 'UNKNOWN';
  const msg = error.toLowerCase();
  if (msg.includes('auth') || msg.includes('token') || msg.includes('expired') || msg.includes('unauthorized')) return 'AUTH_EXPIRED';
  if (msg.includes('rate limit') || msg.includes('429')) return 'RATE_LIMIT';
  if (msg.includes('missing') || msg.includes('required') || msg.includes('field')) return 'MISSING_FIELDS';
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('transient')) return 'TRANSIENT';
  if (msg.includes('api') || msg.includes('500') || msg.includes('502') || msg.includes('503')) return 'API_FAILURE';
  return 'UNKNOWN';
};

const recover = async (execution, node, error, retryCount = 0) => {
  const failureType = classify(error);
  const policy = FAILURE_TYPES[failureType];
  const maxRetries = 3;

  if (policy.retryable && retryCount < maxRetries) {
    const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 30000);

    await executionService.addLog({
      executionId: execution._id,
      workflowId: execution.workflowId,
      nodeId: node.id,
      agent: 'recovery',
      level: 'warning',
      message: `Classified as ${failureType}, retrying with backoff (${backoffMs}ms, attempt ${retryCount + 1}/${maxRetries})`,
      metadata: { failureType, strategy: 'retry_with_backoff', backoffMs, retryCount: retryCount + 1 },
    });

    await new Promise((resolve) => setTimeout(resolve, backoffMs));

    return { action: 'retry_with_backoff', failureType, backoffMs };
  }

  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: node.id,
    agent: 'recovery',
    level: 'error',
    message: `Classified as ${failureType}, escalating: ${policy.strategy}`,
    metadata: { failureType, strategy: 'escalate', retryCount },
  });

  return { action: 'escalate', failureType };
};

module.exports = { recover, classify, FAILURE_TYPES };
