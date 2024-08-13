import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    engagingID: { type: String },
    engagingPrompt: { type: String},
    engagingVideo: { type: String },
    engagingImage: mongoose.Schema.Types.Mixed,

});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
