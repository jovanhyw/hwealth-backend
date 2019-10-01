const express = require('express');
const router = express.Router();
const profileService = require('../services/profile.service');

router.get('/', profileService.getProfile);

module.exports = router;
