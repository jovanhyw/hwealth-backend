const express = require('express');
const router = express.Router();
const twoFactorService = require('../services/twofactor.service');

router.post('/get-authenticator', twoFactorService.generateSecret);

module.exports = router;
