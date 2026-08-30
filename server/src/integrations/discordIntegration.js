const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getRequiredScopes() {
    return ['bot', 'identify'];
  }

  async execute(action, params, token) {
    if (!token) throw new Error('INTEGRATION_NOT_CONNECTED');

    switch (action) {
      case 'send': {
        const channelId = params.channel || params.channelId;
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: params.text || params.message,
          }),
        });
        if (!response.ok) throw new Error(`Discord send failed: ${response.statusText}`);
        const data = await response.json();
        return { success: true, output: { messageId: data.id, channelId: data.channel_id } };
      }

      default:
        throw new Error(`Unknown Discord action: ${action}`);
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

module.exports = new DiscordIntegration();
