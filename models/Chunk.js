// models/Chunk.js
import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  files_id: mongoose.Schema.Types.ObjectId,
  n: Number,
  data: Buffer,
}, { collection: 'uploads.chunks' });

const Chunk = mongoose.models.Chunk || mongoose.model('Chunk', chunkSchema);

export default Chunk;
