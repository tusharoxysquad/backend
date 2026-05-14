const mongoose = require('mongoose');
const { ATTENDANCE_STATUS, APPROVAL_STATUS } = require('../constants');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD for easy querying
      required: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalWorkedHours: {
      type: Number,
      default: 0,
    },
    attendanceStatus: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(APPROVAL_STATUS),
      default: APPROVAL_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    earlyExit: {
      type: Boolean,
      default: false,
    },
    lateArrival: {
      type: Boolean,
      default: false,
    },
    autoEnded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index: one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ approvalStatus: 1 });
attendanceSchema.index({ attendanceStatus: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
