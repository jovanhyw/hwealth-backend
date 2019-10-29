const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  members: [
    {
      accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
      },
      _id: false
    }
  ]
});

ConversationSchema.set('timestamps', true);

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
