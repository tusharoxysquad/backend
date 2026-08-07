const mongoose = require('mongoose');
const { JOB_TYPE, JOB_STATUS } = require('../constants');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxlength: [200, 'Position cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPE),
      required: [true, 'Job type is required'],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    keyRequirements: {
      type: [String],
      default: [],
    },
    preferredQualifications: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

jobSchema.index({ isDeleted: 1, status: 1 });
jobSchema.index({ title: 'text', position: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
