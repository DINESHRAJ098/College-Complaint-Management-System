const workflowService = require('../services/workflowService');
const executionService = require('../services/executionService');
const orchestrator = require('../agents/orchestrator');
const { addJob } = require('../queues/executionQueue');

exports.create = async (req, res) => {
  try {
    const workflow = await workflowService.create(req.userId, req.body);
    res.status(201).json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await workflowService.list(req.userId, { page: +page || 1, limit: +limit || 20, search, status });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const workflow = await workflowService.getById(req.userId, req.params.id);
    res.json(workflow);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const workflow = await workflowService.update(req.userId, req.params.id, req.body);
    res.json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await workflowService.remove(req.userId, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.duplicate = async (req, res) => {
  try {
    const workflow = await workflowService.duplicate(req.userId, req.params.id);
    res.status(201).json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.generate = async (req, res) => {
  try {
    const { prompt } = req.body;
    const workflow = await workflowService.generateFromPrompt(req.userId, prompt);
    res.status(201).json(workflow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.execute = async (req, res) => {
  try {
    const execution = await executionService.create(req.userId, req.params.id, req.body?.inputs);

    addJob({ executionId: execution._id.toString(), userId: req.userId.toString() }).then(() => {
      orchestrator.run(execution._id).catch((err) => console.error('Execution error:', err.message));
    });

    res.status(201).json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const stats = await workflowService.getDashboardStats(req.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
