const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const MessageService = {};
const { messageValidation } = require('../utils/validation');

MessageService.sendMsg = async (req, res) => {
  // input validation
  const { error } = messageValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    let convId = null;

    // first, check if conv exist
    /**
     * fixed bug; have to use $and to query for the condition
     * or else it will create another conver with
     * obj0: recipient, obj1: currUser
     */
    const conversationExist = await Conversation.findOne({
      $and: [
        { members: { $elemMatch: { accountId: req.account.accountid } } },
        { members: { $elemMatch: { accountId: req.body.recipient } } }
      ]
    });

    if (conversationExist) {
      // if it exists, get the conversation id
      convId = conversationExist._id;
    } else {
      // else, create a new conversation
      try {
        const conv = new Conversation({
          members: [
            { accountId: req.account.accountid },
            { accountId: req.body.recipient }
          ]
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
