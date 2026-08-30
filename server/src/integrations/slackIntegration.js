const BaseIntegration = require('./baseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getRequiredScopes() {
    return ['chat:write', 'channels:read'];
  }

  async execute(action, params, token) {
    if (!token) throw new Error('INTEGRATION_NOT_CONNECTED');

    switch (action) {
      case 'send': {
        const response = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: params.channel || params.to,
            text: params.text || params.message,
          }),
        });
        const data = await response.json();
        if (!data.ok) throw new Error(`Slack send failed: ${data.error}`);
        return { success: true, output: { ts: data.ts, channel: data.channel } };
      }

      case 'channels': {
        const response = await fetch('https://slack.com/api/conversations.list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!data.ok) throw new Error(`Slack channels failed: ${data.error}`);
        return { success: true, output: { channels: data.channels } };
      }

      default:
        throw new Error(`Unknown Slack action: ${action}`);
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.ok;
    } catch {
      return false;
    }
  }
}

module.exports = new SlackIntegration();
