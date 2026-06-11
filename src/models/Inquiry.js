const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
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
      trim: true,
      default: null,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    companyName: {
      type: String,
      trim: true,
      default: null,
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    serviceDetails: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, 'Service details cannot exceed 500 characters'],
    },
    estimatedBudget: {
      type: String,
      trim: true,
      default: null,
      maxlength: [50, 'Estimated budget cannot exceed 50 characters'],
    },
    subject: {
      type: String,
      trim: true,
      default: null,
      maxlength: [150, 'Subject cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ'],
      default: 'UNREAD',
    },
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

inquirySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

inquirySchema.index({ email: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
