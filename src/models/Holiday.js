const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Date is required'],
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['National', 'Company', 'Optional'],
      required: [true, 'Type is required'],
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number, // 1–12
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// date index is already created by unique:true on the field
holidaySchema.index({ year: 1, month: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);
