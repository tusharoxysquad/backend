const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants');

const userSchema = new mongoose.Schema(
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
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE,
    },
    department: {
      type: String,
      trim: true,
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      default: null,
    },
    reportingAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a fresh 6-digit OTP, store its hash + expiry, and return the plaintext code to email out
const OTP_EXPIRY_MINUTES = 10;
userSchema.methods.setOtp = async function () {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  this.otp = await bcrypt.hash(otp, 10);
  this.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  return otp;
};

// Compare candidate OTP against stored hash, honoring expiry
userSchema.methods.compareOtp = async function (candidateOtp) {
  if (!this.otp || !this.otpExpiry) return false;
  if (this.otpExpiry.getTime() < Date.now()) return false;
  return bcrypt.compare(candidateOtp, this.otp);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  return obj;
};

// Indexes — email index is already created by unique:true on the field
userSchema.index({ role: 1 });
userSchema.index({ reportingAdmin: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
