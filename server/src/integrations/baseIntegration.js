class BaseIntegration {
  constructor(provider) {
    this.provider = provider;
  }

  async authenticate(credentials) {
    throw new Error('authenticate() must be implemented');
  }

  async execute(action, params, token) {
    throw new Error('execute() must be implemented');
  }

  async validateToken(token) {
    throw new Error('validateToken() must be implemented');
  }

  async refreshToken(refreshToken) {
    throw new Error('refreshToken() must be implemented');
  }

  getRequiredScopes() {
    return [];
  }
}

module.exports = BaseIntegration;
