const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorName: {
    type: String,
    default: 'System'
  },
  actorRole: {
    type: String,
    default: 'system'
  },
  note: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Hostel & Mess',
        'Academic & Faculty',
        'Infrastructure & Civil',
        'Electrical & Maintenance',
        'IT & Labs',
        'Library & Resources',
        'Anti-Ragging & Harassment',
        'Fee & Accounts',
        'Transport & Parking',
        'Sanitation & Hygiene',
        'General Grievance'
      ],
      default: 'General Grievance'
    },
    subcategory: {
      type: String,
      default: ''
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    departmentName: {
      type: String,
      default: ''
    },
    complainant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    complainantName: {
      type: String,
      default: ''
    },
    complainantRollNo: {
      type: String,
      default: ''
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Rejected',
        'Reopened',
        'Closed'
      ],
      default: 'Submitted'
    },
    location: {
      block: { type: String, default: '' },
      floor: { type: String, default: '' },
      roomOrArea: { type: String, default: '' }
    },
    attachments: [
      {
        url: String,
        name: String,
        fileType: String
      }
    ],
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedOfficerName: {
      type: String,
      default: ''
    },
    slaDeadline: {
      type: Date,
      default: null
    },
    isSlaBreached: {
      type: Boolean,
      default: false
    },
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    escalationReason: {
      type: String,
      default: ''
    },
    resolution: {
      notes: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      resolvedByName: { type: String, default: '' },
      proofAttachments: [{ url: String, name: String }]
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: '' },
      submittedAt: { type: Date, default: null }
    },
    aiAnalysis: {
      suggestedCategory: { type: String, default: '' },
      suggestedPriority: { type: String, default: '' },
      urgencyScore: { type: Number, default: 50 },
      sentiment: { type: String, default: 'Neutral' },
      keywords: [{ type: String }],
      suggestedChecklist: [{ type: String }]
    },
    timeline: [timelineEventSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure ticket number and SLA calculation
complaintSchema.pre('validate', async function (next) {
  if (!this.ticketNumber) {
    const dateStr = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.ticketNumber = `CMP-${dateStr}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
