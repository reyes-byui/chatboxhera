const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: String, required: true },
}, { collection: 'chats' });

module.exports = mongoose.model('Chat', chatSchema);
