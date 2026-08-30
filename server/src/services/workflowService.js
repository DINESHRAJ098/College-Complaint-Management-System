const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const aiService = require('./aiService');

const create = async (userId, data) => {
  const workflow = await Workflow.create({ ...data, owner: userId });
  return workflow;
};

const list = async (userId, { page = 1, limit = 20, search, status } = {}) => {
  const query = { owner: userId };
  if (status) query.status = status;
  if (search) query.name = { $regex: search, $options: 'i' };

  const total = await Workflow.countDocuments(query);
  const workflows = await Workflow.find(query)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { workflows, total, page, totalPages: Math.ceil(total / limit) };
};

const getById = async (userId, workflowId) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) throw new Error('Workflow not found');
  return workflow;
};

const update = async (userId, workflowId, data) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) throw new Error('Workflow not found');

  Object.assign(workflow, data);
  workflow.version += 1;
  await workflow.save();
  return workflow;
};

const remove = async (userId, workflowId) => {
  const workflow = await Workflow.findOneAndDelete({ _id: workflowId, owner: userId });
  if (!workflow) throw new Error('Workflow not found');
  return { message: 'Workflow deleted' };
};

const duplicate = async (userId, workflowId) => {
  const original = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!original) throw new Error('Workflow not found');

  const copy = await Workflow.create({
    name: `${original.name} (Copy)`,
    description: original.description,
    owner: userId,
    nodes: original.nodes,
    edges: original.edges,
    triggerConfig: original.triggerConfig,
    tags: original.tags,
    status: 'draft',
  });
  return copy;
};

const generateFromPrompt = async (userId, prompt) => {
  const workflow = await aiService.generateWorkflow(prompt, userId);
  return workflow;
};

const getDashboardStats = async (userId) => {
  const totalWorkflows = await Workflow.countDocuments({ owner: userId });
  const activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });

  const recentExecutions = await Execution.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('workflowId', 'name');

  const totalExecutions = await Execution.countDocuments({ userId });
  const successfulExecutions = await Execution.countDocuments({ userId, status: 'COMPLETED' });
  const failedExecutions = await Execution.countDocuments({ userId, status: 'FAILED' });
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  const runningExecutions = await Execution.countDocuments({ userId, status: 'RUNNING' });

  return {
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate,
    runningExecutions,
    recentExecutions,
  };
};

module.exports = {
  create,
  list,
  getById,
  update,
  remove,
  duplicate,
  generateFromPrompt,
  getDashboardStats,
};
