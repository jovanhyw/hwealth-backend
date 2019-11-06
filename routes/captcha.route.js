const express = require('express');
const router = express.Router();
const captchaService = require('../services/captcha.service');

router.post('/', captchaService.verifyCaptcha);
router.post('/v3', captchaService.verifyCaptchaWebV3);

module.exports = router;
