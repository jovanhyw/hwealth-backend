const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
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

ConversationService.getAllMessages = async (req, res) => {
  try {
    let members = null;
    const conversationExist = await Conversation.findById({
      _id: req.params.conversationId
    });

    if (!conversationExist) {
      return res.status(404).send({
        error: true,
        message: 'Conversation does not exist.'
      });
    }

    members = conversationExist.members;

    if (!members.includes(req.account.accountid)) {
      return res.status(403).send({
        error: true,
        message:
          'You are not authorized to view the messages in this conversation.'
      });
    }

    try {
      const messages = await Message.find(
        { conversationId: req.params.conversationId },
        'message sentBy createdAt -_id'
      );
      res.status(200).send({
        error: false,
        messages
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Unable to retrieve messages.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = ConversationService;
