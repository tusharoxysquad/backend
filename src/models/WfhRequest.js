const mongoose = require('mongoose');

const WFH_STATUS = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED', CANCELLED: 'CANCELLED' };

const wfhRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate:   { type: Date, required: true },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: Object.values(WFH_STATUS),
      default: WFH_STATUS.PENDING,
    },
    approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt:      { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

wfhRequestSchema.index({ employeeId: 1 });
wfhRequestSchema.index({ status: 1 });
wfhRequestSchema.index({ fromDate: 1, toDate: 1 });

module.exports = mongoose.model('WfhRequest', wfhRequestSchema);
