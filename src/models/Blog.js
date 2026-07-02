const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    thumbnail: {
      imageUrl: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    meta: {
      title: { type: String, default: null },
      description: { type: String, default: null },
      keywords: { type: [String], default: [] },
    },
    category: { type: String, trim: true, default: null },
    tags: { type: [String], default: [] },
    readTime: { type: String, default: null },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    sections: [
      {
        title: { type: String, required: true },
        description: { type: String, default: null },
        points: [
          {
            title: { type: String, default: null },
            description: { type: String, required: true },
          },
        ],
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
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

blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
