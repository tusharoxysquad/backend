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
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    country: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    designation: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    messengerType: {
      type: String,
      enum: ['Meet', 'Teams', 'Google', 'Others'],
      default: null,
    },
    messengerId: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, 'Messenger ID cannot exceed 200 characters'],
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
