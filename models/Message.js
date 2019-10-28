const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

MessageSchema.set('timestamps', true);

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
