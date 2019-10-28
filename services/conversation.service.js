const Conversation = require('../models/Conversation');
const ConversationService = {};

ConversationService.getAllConversation = async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.account.accountid] }
    });

    if (!conversation) {
      return res.status(404).send({
        error: true,
        message: 'No conversations found.'
      });
    }

    res.status(200).send({
      error: false,
      conversation
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

ConversationService.createConv = async (req, res) => {
  try {
    const conv = new Conversation({
      members: [req.account.accountid, req.body.recipient]
    });

    conv.save();

    res.status(200).send({
      error: false,
      conv
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = ConversationService;
