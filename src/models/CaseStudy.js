const mongoose = require('mongoose');

const imageField = () => ({
  imageUrl: { type: String, default: null },
  publicId: { type: String, default: null },
});

const caseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    clientName: { type: String, trim: true },
    industry: { type: String, trim: true },
    year: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    hero: {
      title: { type: String, trim: true },
      subtitle: { type: String, trim: true },
      description: { type: String },
      bannerImage: { ...imageField() },
      logo: { ...imageField() },
      tags: { type: [String], default: [] },
    },
    overview: { type: mongoose.Schema.Types.Mixed, default: {} },
    brief: { type: mongoose.Schema.Types.Mixed, default: {} },
    challenge: { type: mongoose.Schema.Types.Mixed, default: {} },
    solution: { type: mongoose.Schema.Types.Mixed, default: {} },
    technologyStack: { type: [mongoose.Schema.Types.Mixed], default: [] },
    features: { type: [mongoose.Schema.Types.Mixed], default: [] },
    results: { type: [mongoose.Schema.Types.Mixed], default: [] },
    testimonials: { type: [mongoose.Schema.Types.Mixed], default: [] },
    gallery: { type: [{ ...imageField() }], default: [] },
    figmaScreens: { type: [{ ...imageField() }], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Auto-generate slug from title, append timestamp suffix to guarantee uniqueness
caseStudySchema.pre('save', function (next) {
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

caseStudySchema.index({ industry: 1 });
caseStudySchema.index({ status: 1 });
caseStudySchema.index({ year: 1 });

module.exports = mongoose.model('CaseStudy', caseStudySchema);
