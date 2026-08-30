const BaseIntegration = require('./baseIntegration');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getRequiredScopes() {
    return ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];
  }

  async execute(action, params, token) {
    if (!token) throw new Error('INTEGRATION_NOT_CONNECTED');

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    switch (action) {
      case 'send': {
        const email = [
          `To: ${params.to}`,
          `Subject: ${params.subject || ''}`,
          'Content-Type: text/html; charset=utf-8',
          '',
          params.body || '',
        ].join('\r\n');

        const encodedMessage = Buffer.from(email).toString('base64url');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers,
          body: JSON.stringify({ raw: encodedMessage }),
        });

        if (!response.ok) throw new Error(`Gmail send failed: ${response.statusText}`);
        const data = await response.json();
        return { success: true, output: { messageId: data.id, threadId: data.threadId } };
      }

      case 'read': {
        const maxResults = params.maxResults || 10;
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
          { headers }
        );
        if (!response.ok) throw new Error(`Gmail read failed: ${response.statusText}`);
        const data = await response.json();
        return { success: true, output: { messages: data.messages || [], total: data.resultSizeEstimate } };
      }

      default:
        throw new Error(`Unknown Gmail action: ${action}`);
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

module.exports = new GmailIntegration();
