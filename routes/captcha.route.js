const express = require('express');
const router = express.Router();
const captchaService = require('../services/captcha.service');

router.post('/', captchaService.verifyCaptcha);

module.exports = router;
