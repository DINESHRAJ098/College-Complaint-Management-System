const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    authorRole: {
      type: String,
      enum: ['student', 'officer', 'admin', 'committee'],
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true
    },
    isInternalNote: {
      type: Boolean,
      default: false
    },
    attachments: [
      {
        url: String,
        name: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', commentSchema);
