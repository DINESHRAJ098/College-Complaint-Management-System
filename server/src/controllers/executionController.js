const executionService = require('../services/executionService');

exports.list = async (req, res) => {
  try {
    const { page, limit, status, workflowId } = req.query;
    const result = await executionService.list(req.userId, {
      page: +page || 1,
      limit: +limit || 20,
      status,
      workflowId,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const execution = await executionService.getById(req.userId, req.params.id);
    res.json(execution);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.timeline = async (req, res) => {
  try {
    const logs = await executionService.getTimeline(req.userId, req.params.id);
    res.json(logs);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.pause = async (req, res) => {
  try {
    const execution = await executionService.pause(req.userId, req.params.id);
    res.json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.resume = async (req, res) => {
  try {
    const execution = await executionService.resume(req.userId, req.params.id);
    res.json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  try {
    const execution = await executionService.cancel(req.userId, req.params.id);
    res.json(execution);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
