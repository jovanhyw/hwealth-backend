const express = require('express');
const router = express.Router();
const accountService = require('../services/account.service');

router.get('/:id', accountService.getAccount);
router.post('/register', accountService.register);
router.put('/:id/update-email', accountService.updateEmail);
router.put('/:id/update-password', accountService.updatePassword);

module.exports = router;
