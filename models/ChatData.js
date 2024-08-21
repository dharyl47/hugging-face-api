// models/User.js
import mongoose from 'mongoose';

const ChatData = new mongoose.Schema({
  friendlyTone: String,
  mainPrompt: String,
  llamaModel: String,
});

const Chat = mongoose.models.Chatsetting || mongoose.model('Chatsetting', ChatData);

export default Chat;
