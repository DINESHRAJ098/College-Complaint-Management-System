const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const Workflow = require('../models/Workflow');
const { emitToExecution, emitToUser } = require('../config/socket');

const create = async (userId, workflowId, inputs = {}) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) throw new Error('Workflow not found');

  const execution = await Execution.create({
    workflowId,
    userId,
    workflowSnapshot: workflow.toObject(),
    inputs,
    status: 'PENDING',
  });

  return execution;
};

const list = async (userId, { page = 1, limit = 20, status, workflowId } = {}) => {
  const query = { userId };
  if (status) query.status = status;
  if (workflowId) query.workflowId = workflowId;

  const total = await Execution.countDocuments(query);
  const executions = await Execution.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('workflowId', 'name');

  return { executions, total, page, totalPages: Math.ceil(total / limit) };
};

const getById = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, userId }).populate('workflowId', 'name');
  if (!execution) throw new Error('Execution not found');
  return execution;
};

const getTimeline = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, userId });
  if (!execution) throw new Error('Execution not found');

  const logs = await ExecutionLog.find({ executionId }).sort({ createdAt: 1 });
  return logs;
};

const updateStatus = async (executionId, status, extra = {}) => {
  const execution = await Execution.findById(executionId);
  if (!execution) throw new Error('Execution not found');

  const now = new Date();
  execution.status = status;

  if (status === 'RUNNING' && !execution.startTime) {
    execution.startTime = now;
  }

  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
    execution.endTime = now;
    execution.duration = execution.startTime ? now - execution.startTime : 0;
  }

  if (extra.error) execution.error = extra.error;
  if (extra.currentNode) execution.currentNode = extra.currentNode;
  if (extra.outputs) execution.outputs = extra.outputs;

  await execution.save();
  emitToExecution(executionId, 'execution:update', {
    executionId,
    status: execution.status,
    currentNode: execution.currentNode,
    duration: execution.duration,
  });

  return execution;
};

const addLog = async ({ executionId, workflowId, nodeId, agent, level, message, metadata = {} }) => {
  const log = await ExecutionLog.create({
    executionId,
    workflowId,
    nodeId,
    agent,
    level,
    message,
    metadata,
  });

  emitToExecution(executionId, 'agent:event', {
    executionId,
    logId: log._id,
    nodeId,
    agent,
    level,
    message,
    metadata,
    timestamp: log.createdAt,
  });

  return log;
};

const pause = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, userId });
  if (!execution) throw new Error('Execution not found');
  if (!['RUNNING', 'PENDING'].includes(execution.status)) {
    throw new Error(`Cannot pause execution in ${execution.status} state`);
  }
  return updateStatus(executionId, 'PAUSED');
};

const resume = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, userId });
  if (!execution) throw new Error('Execution not found');
  if (execution.status !== 'PAUSED') {
    throw new Error('Execution is not paused');
  }
  return updateStatus(executionId, 'RUNNING');
};

const cancel = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, userId });
  if (!execution) throw new Error('Execution not found');
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
    throw new Error(`Cannot cancel execution in ${execution.status} state`);
  }
  return updateStatus(executionId, 'CANCELLED');
};

const createNotification = async ({ userId, workflowId, executionId, type, title, message }) => {
  const notification = await Notification.create({
    owner: userId,
    workflowId,
    executionId,
    type,
    title,
    message,
  });

  emitToUser(userId, 'notification:new', notification);
  return notification;
};

module.exports = {
  create,
  list,
  getById,
  getTimeline,
  updateStatus,
  addLog,
  pause,
  resume,
  cancel,
  createNotification,
};
