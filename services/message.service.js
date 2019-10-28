const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const MessageService = {};

MessageService.sendMsg = async (req, res) => {
  // input validation

  try {
    let convId = null;

    // first, check if conv exist
    const conversationExist = await Conversation.findOne({
      members: [req.account.accountid, req.body.recipient]
    });

    if (conversationExist) {
      // if it exists, get the conversation id
      convId = conversationExist._id;
    } else {
      // else, create a new conversation
      try {
        const conv = new Conversation({
          members: [req.account.accountid, req.body.recipient]
        });

        await conv.save();
        convId = conv._id;
      } catch (err) {
        return res.status(500).send({
          error: true,
          message: 'Internal Server Error. Failed to create conversation.'
        });
      }
    }

    try {
      const msg = new Message({
        conversationId: convId,
        sentBy: req.account.accountid,
        message: req.body.message
      });

      await msg.save();

      return res.status(200).send({
        error: false,
        message: 'Message sent successfully.'
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to send message.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = MessageService;
