const mongoose = require('mongoose');

const SERVICE_OPTIONS = [
  'AI & Automation',
  'Custom Software Development',
  'Web Development',
  'Mobile App Development',
  'Data Analytics & BI',
  'Cloud & DevOps',
  'Digital Transformation',
  'UI/UX Design',
  'Dedicated Development Team',
  'Other',
];

const TIMELINE_OPTIONS = [
  'Immediate',
  'Within 1 Month',
  'Within 3 Months',
  'Within 6 Months',
  'Exploring Options',
];

const REQUIREMENT_OPTIONS = [
  'New Product Development',
  'Existing Product Enhancement',
  'Dedicated Team Hiring',
  'AI Implementation',
  'Digital Transformation',
  'Support & Maintenance',
  'Not Sure Yet',
];

const inquirySchema = new mongoose.Schema(
  {
    // ── Contact Info ────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    designation: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },

    // ── Company Info ────────────────────────────────────────────────────────
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: null,
      match: [
        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
        'Please provide a valid website URL',
      ],
    },

    // ── Service & Project ───────────────────────────────────────────────────
    serviceInterestedIn: {
      type: String,
      required: [true, 'Service interested in is required'],
      enum: { values: SERVICE_OPTIONS, message: 'Invalid service option' },
    },
    serviceInterestedOther: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, 'Cannot exceed 200 characters'],
    },
    projectTimeline: {
      type: String,
      required: [true, 'Project timeline is required'],
      enum: { values: TIMELINE_OPTIONS, message: 'Invalid timeline option' },
    },
    requirementType: {
      type: String,
      required: [true, 'Requirement type is required'],
      enum: { values: REQUIREMENT_OPTIONS, message: 'Invalid requirement type' },
    },
    requirementTypeOther: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, 'Cannot exceed 200 characters'],
    },
    projectDescription: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [3000, 'Project description cannot exceed 3000 characters'],
    },

    // ── Discovery ───────────────────────────────────────────────────────────
    heardAboutUs: {
      type: String,
      trim: true,
      default: null,
    },
    heardAboutUsOther: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, 'Cannot exceed 200 characters'],
    },

    // ── Consent ─────────────────────────────────────────────────────────────
    agreeToContact: {
      type: Boolean,
      required: [true, 'You must agree to be contacted'],
      validate: {
        validator: (value) => value === true,
        message: 'You must agree to be contacted.',
      },
    },

    // ── Document Upload ─────────────────────────────────────────────────────
    document: {
      fileName: { type: String, default: null },
      originalName: { type: String, default: null },
      fileUrl: { type: String, default: null },
      fileSize: { type: Number, default: null },
      mimeType: { type: String, default: null },
    },

    // ── Admin Fields ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['UNREAD', 'READ'],
      default: 'UNREAD',
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Soft delete filter — exclude deleted docs from all queries
inquirySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

inquirySchema.index({ email: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ serviceInterestedIn: 1 });
inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
