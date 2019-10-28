const express = require('express');
const router = express.Router();
const conversationService = require('../services/conversation.service');

router.get('/', conversationService.getAllConversation);
router.post('/', conversationService.createConv);

module.exports = router;
