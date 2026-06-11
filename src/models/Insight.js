const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    sections: { type: [mongoose.Schema.Types.Mixed], default: [] },
    future_predictions: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    key_takeaways: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    author: { type: String, trim: true },
    publication_date: { type: Date },
    target_audience: { type: [String], default: [] },
    priority_level: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
    strategic_impact: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
    // Image
    imageUrl: { type: String, default: null },
    publicId: { type: String, default: null },
    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

insightSchema.index({ category: 1 });
insightSchema.index({ industry: 1 });
insightSchema.index({ priority_level: 1 });

module.exports = mongoose.model('Insight', insightSchema);
