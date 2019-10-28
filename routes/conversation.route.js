const express = require('express');
const router = express.Router();
const conversationService = require('../services/conversation.service');

router.get('/', conversationService.getAllConversation);
router.get('/:conversationId', conversationService.getAllMessages);

module.exports = router;
