const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workflowSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
    },
    currentNode: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },
    inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

executionSchema.index({ workflowId: 1, createdAt: -1 });
executionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Execution', executionSchema);
