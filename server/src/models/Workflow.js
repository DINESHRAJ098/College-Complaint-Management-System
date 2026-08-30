const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    label: { type: String, default: '' },
    position: { type: Object, default: { x: 0, y: 0 } },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String, default: '' },
    animated: { type: Boolean, default: true },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'active', 'paused', 'archived'], default: 'draft' },
    triggerConfig: {
      type: { type: String, enum: ['manual', 'scheduled', 'webhook'], default: 'manual' },
      cron: { type: String },
      webhookUrl: { type: String },
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    version: { type: Number, default: 1 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

workflowSchema.index({ owner: 1, status: 1 });
workflowSchema.index({ owner: 1, name: 'text' });

module.exports = mongoose.model('Workflow', workflowSchema);
