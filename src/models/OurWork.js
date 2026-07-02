const mongoose = require('mongoose');

const ourWorkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    introduction: { type: String, default: null },
    challenge: { type: String, default: null },
    solution: { type: String, default: null },
    technologyStack: { type: [String], default: [] },
    bannerImage: {
      imageUrl: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

ourWorkSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    this.slug = this.isNew ? `${base}-${Date.now()}` : base;
  }
  next();
});

module.exports = mongoose.model('OurWork', ourWorkSchema);
