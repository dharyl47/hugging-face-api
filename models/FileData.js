// models/File.js
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: String,
  metadata: mongoose.Schema.Types.Mixed,
  // Add other fields if needed
}, { collection: 'uploads.files' });

const FileData = mongoose.models.File || mongoose.model('File', fileSchema);

export default FileData;
