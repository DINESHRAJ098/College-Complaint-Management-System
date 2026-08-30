const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    headOfficerName: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Main Administrative Block'
    },
    categories: [
      {
        type: String,
        trim: true
      }
    ],
    defaultSlaHours: {
      type: Number,
      default: 48
    },
    color: {
      type: String,
      default: '#3B82F6'
    },
    icon: {
      type: String,
      default: 'Building'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Department', departmentSchema);
