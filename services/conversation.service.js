const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ConversationService = {};

ConversationService.getAllConversation = async (req, res) => {
  try {
    // this will return all the conver related to this accountId
    const allConversation = await Conversation.find(
      {
        'members.accountId': req.account.accountid
      },
      'members'
    ).populate({
      path: 'members.accountId',
      select: 'username'
    });

    if (!allConversation) {
      return res.status(404).send({
        error: true,
        message: 'No conversations found.'
      });
    }

    // this will filter out the current user from the members
    // array, so that frontend can display the recipient
    // more conveniently
    allConversation.forEach(conversation => {
      conversation.members = conversation.members.filter(participant => {
        return participant.accountId._id != req.account.accountid;
      });
    });

    res.status(200).send({
      error: false,
      allConversation
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

    const checkIfUserIsInConversation = arr => {
      let matches = 0;

      for (var i = 0; i < arr.length; i++) {
        if (arr[i].accountId == req.account.accountid) {
          matches++;
        }
      }

      return matches;
    };

    let userAccountIdInConversation = checkIfUserIsInConversation(members);

    if (userAccountIdInConversation < 1) {
      return res.status(403).send({
        error: true,
        message:
          'You are not authorized to view the messages in this conversation.'
      });
    }

    try {
      // populate will populate the objectId, giving us the
      // full account object. we just want the username
      const messages = await Message.find(
        { conversationId: req.params.conversationId },
        'message sentBy createdAt -_id'
      ).populate({
        path: 'sentBy',
        select: 'username'
      });

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
    console.log(err);
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = ConversationService;
