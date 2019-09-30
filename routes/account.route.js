const express = require('express');
const router = express.Router();
const accountService = require('../services/account.service');

router.post('/register', accountService.register);
router.put('/:id', accountService.updateEmail);

module.exports = router;
