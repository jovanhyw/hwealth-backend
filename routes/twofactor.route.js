const express = require('express');
const router = express.Router();
const twoFactorService = require('../services/twofactor.service');
const verifyToken = require('../services/auth.service').verifyToken;
const verifyPreToken = require('../services/auth.service').verifyPreToken;

/**
 * Public Routes
 */
router.post('/recover', twoFactorService.recover);

/**
 * Protected Routes
 */
router.post('/get-authenticator', verifyToken, twoFactorService.generateSecret);
router.post('/enable', verifyToken, twoFactorService.enable);
router.post('/authenticate', verifyPreToken, twoFactorService.authenticate);
router.post('/disable', verifyToken, twoFactorService.disable);
router.get('/get-recovery-code', verifyToken, twoFactorService.getRecoveryCode);

module.exports = router;
