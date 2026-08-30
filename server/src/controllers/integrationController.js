const integrationService = require('../services/integrationService');

exports.list = async (req, res) => {
  try {
    const integrations = await integrationService.list(req.userId);
    res.json(integrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.status = async (req, res) => {
  try {
    const status = await integrationService.getStatus(req.userId);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.oauthStart = async (req, res) => {
  try {
    const url = integrationService.getOAuthUrl(req.userId, req.params.provider);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.oauthCallback = async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;
    const userId = state;
    await integrationService.handleCallback(userId, provider, code);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?connected=${provider}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?error=${encodeURIComponent(err.message)}`);
  }
};

exports.oauthError = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/integrations?error=oauth_failed`);
};

exports.create = async (req, res) => {
  try {
    const { provider, credentials } = req.body;
    const result = await integrationService.createManual(req.userId, provider, credentials);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
