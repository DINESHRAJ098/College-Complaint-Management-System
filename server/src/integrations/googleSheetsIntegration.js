const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getRequiredScopes() {
    return ['https://www.googleapis.com/auth/spreadsheets'];
  }

  async execute(action, params, token) {
    if (!token) throw new Error('INTEGRATION_NOT_CONNECTED');

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    switch (action) {
      case 'append': {
        const { spreadsheetId, range, values } = params;
        if (!spreadsheetId) throw new Error('spreadsheetId is required');
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range || 'A1'}:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ values: values || [[]] }),
          }
        );
        if (!response.ok) throw new Error(`Sheets append failed: ${response.statusText}`);
        const data = await response.json();
        return { success: true, output: { updatedCells: data.updates?.updatedCells, updatedRows: data.updates?.updatedRows } };
      }

      case 'read': {
        const { spreadsheetId, range } = params;
        if (!spreadsheetId) throw new Error('spreadsheetId is required');
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range || 'A1:Z100'}`,
          { headers }
        );
        if (!response.ok) throw new Error(`Sheets read failed: ${response.statusText}`);
        const data = await response.json();
        return { success: true, output: { values: data.values || [], range: data.range } };
      }

      default:
        throw new Error(`Unknown Sheets action: ${action}`);
    }
  }

  async validateToken(token) {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

module.exports = new GoogleSheetsIntegration();
