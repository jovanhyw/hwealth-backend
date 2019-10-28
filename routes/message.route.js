const express = require('express');
const router = express.Router();
const messageService = require('../services/message.service');

router.post('/', messageService.sendMsg);

module.exports = router;
