const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'google-sheets', 'discord', 'openrouter', 'gemini'],
      required: true,
    },
    isConnected: { type: Boolean, default: false },
    scopes: [{ type: String }],
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    providerUserId: { type: String },
    providerData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
