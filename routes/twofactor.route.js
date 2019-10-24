const express = require('express');
const router = express.Router();
const twoFactorService = require('../services/twofactor.service');
const verifyToken = require('../services/auth.service').verifyToken;

/**
 * Public Routes
 */
router.post('/authenticate', verifyToken, twoFactorService.authenticate);

/**
 * Protected Routes
 */
router.post('/get-authenticator', verifyToken, twoFactorService.generateSecret);
router.post('/enable', verifyToken, twoFactorService.enable);

module.exports = router;
