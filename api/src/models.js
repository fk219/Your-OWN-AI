import mongoose from 'mongoose';

const demoVectorSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    category: { type: String, required: true, index: true },
    vector: { type: [Number], required: true }
  },
  { timestamps: true }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true },
    tags: { type: [String], default: [] },
    category: { type: String, default: 'General' },
    embedding: { type: [Number], required: true },
    dims: { type: Number, default: 256 },
    provider: { type: String, default: 'hash-256' }
  },
  { timestamps: true }
);

documentSchema.index({ createdAt: -1 });

export const DemoVector = mongoose.models.DemoVector || mongoose.model('DemoVector', demoVectorSchema);
export const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
