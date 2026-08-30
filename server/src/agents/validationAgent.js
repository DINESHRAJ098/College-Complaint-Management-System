const executionService = require('../services/executionService');

const validate = async (execution, node, result) => {
  const issues = [];

  if (!result) {
    issues.push('No result returned from node execution');
  }

  if (result && result.success === false) {
    issues.push(result.error || 'Node execution failed');
  }

  if (node.type === 'integration' && result?.success) {
    if (!result.output?.provider) issues.push('Missing provider in integration output');
  }

  if (node.type === 'ai' && result?.success) {
    if (!result.output?.result) issues.push('AI node returned no result');
  }

  const level = issues.length > 0 ? 'warning' : 'success';
  const message =
    issues.length > 0
      ? `Validation found ${issues.length} issue(s) for ${node.label || node.id}`
      : `Validation passed for ${node.label || node.id}`;

  await executionService.addLog({
    executionId: execution._id,
    workflowId: execution.workflowId,
    nodeId: node.id,
    agent: 'validation',
    level,
    message,
    metadata: { issues, resultSummary: result?.output },
  });

  return { valid: issues.length === 0, issues };
};

module.exports = { validate };
