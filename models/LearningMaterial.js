import mongoose from 'mongoose';

const learningMaterialSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  addedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.LearningMaterial || mongoose.model('LearningMaterial', learningMaterialSchema);
