const mongoose = require('mongoose');
const { APPROVAL_STATUS } = require('../constants');

const overtimeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    overtimeCheckIn: {
      type: Date,
      default: null,
    },
    overtimeCheckOut: {
      type: Date,
      default: null,
    },
    overtimeDuration: {
      type: Number, // in hours
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.PENDING,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// One overtime record per employee per day
overtimeSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Overtime', overtimeSchema);
