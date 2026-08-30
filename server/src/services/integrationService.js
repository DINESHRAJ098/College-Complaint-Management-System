const crypto = require('crypto');
const Integration = require('../models/Integration');
const env = require('../config/env');

const ENCRYPTION_KEY = Buffer.from(
  (env.CREDENTIAL_ENCRYPTION_KEY || 'agentflow-dev-encryption-key-32ch!').padEnd(32, '0').slice(0, 32)
);

const encrypt = (text) => {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  if (!text) return '';
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const PROVIDERS = {
  gmail: {
    name: 'Gmail',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    clientId: 'GOOGLE_CLIENT_ID',
    clientSecret: 'GOOGLE_CLIENT_SECRET',
  },
  slack: {
    name: 'Slack',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    scopes: ['chat:write', 'channels:read'],
    clientId: 'SLACK_CLIENT_ID',
    clientSecret: 'SLACK_CLIENT_SECRET',
  },
  discord: {
    name: 'Discord',
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scopes: ['bot', 'identify'],
    clientId: 'DISCORD_CLIENT_ID',
    clientSecret: 'DISCORD_CLIENT_SECRET',
  },
  'google-sheets': {
    name: 'Google Sheets',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    clientId: 'GOOGLE_SHEETS_CLIENT_ID',
    clientSecret: 'GOOGLE_SHEETS_CLIENT_SECRET',
  },
};

const list = async (userId) => {
  const integrations = await Integration.find({ owner: userId });
  const connected = new Map(integrations.map((i) => [i.provider, i]));

  return Object.entries(PROVIDERS).map(([key, prov]) => {
    const existing = connected.get(key);
    return {
      provider: key,
      name: prov.name,
      isConnected: existing?.isConnected || false,
      scopes: prov.scopes,
      expiresAt: existing?.expiresAt,
    };
  });
};

const getStatus = async (userId) => {
  return list(userId);
};

const getOAuthUrl = (userId, provider) => {
  const prov = PROVIDERS[provider];
  if (!prov) throw new Error('Unknown provider');

  const clientId = env[prov.clientId];
  if (!clientId) throw new Error(`${prov.name} OAuth not configured. Missing ${prov.clientId}`);

  const redirectUri = `${env.CLIENT_URL || 'http://localhost:5000'}/api/integrations/oauth/${provider}/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: prov.scopes.join(' '),
    state: userId,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${prov.authUrl}?${params.toString()}`;
};

const handleCallback = async (userId, provider, code) => {
  const prov = PROVIDERS[provider];
  if (!prov) throw new Error('Unknown provider');

  const clientId = env[prov.clientId];
  const clientSecret = env[prov.clientSecret];
  if (!clientId || !clientSecret) throw new Error(`${prov.name} OAuth not configured`);

  const redirectUri = `${env.CLIENT_URL || 'http://localhost:5000'}/api/integrations/oauth/${provider}/callback`;

  const tokenResponse = await fetch(prov.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokenData = await tokenResponse.json();

  const integration = await Integration.findOneAndUpdate(
    { owner: userId, provider },
    {
      isConnected: true,
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : undefined,
      expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      scopes: prov.scopes,
    },
    { upsert: true, new: true }
  );

  return { provider, isConnected: true };
};

const getDecryptedToken = async (userId, provider) => {
  const integration = await Integration.findOne({ owner: userId, provider });
  if (!integration || !integration.isConnected) return null;
  if (integration.expiresAt && integration.expiresAt < new Date()) return null;
  return decrypt(integration.accessToken);
};

const createManual = async (userId, provider, credentials) => {
  const integration = await Integration.findOneAndUpdate(
    { owner: userId, provider },
    {
      isConnected: true,
      accessToken: encrypt(credentials.accessToken),
      refreshToken: credentials.refreshToken ? encrypt(credentials.refreshToken) : undefined,
      scopes: credentials.scopes || PROVIDERS[provider]?.scopes || [],
    },
    { upsert: true, new: true }
  );
  return { provider, isConnected: true };
};

module.exports = { list, getStatus, getOAuthUrl, handleCallback, getDecryptedToken, createManual, encrypt, decrypt };
