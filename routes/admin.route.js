const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');
const verifyToken = require('../services/auth.service').verifyToken;
const checkAdminRole = require('../services/auth.service').checkAdminRole;

router.post(
  '/search',
  verifyToken,
  checkAdminRole,
  adminService.searchForAccount
);
router.post(
  '/update-role',
  verifyToken,
  checkAdminRole,
  adminService.updateAccountRole
);
router.post(
  '/update-lock',
  verifyToken,
  checkAdminRole,
  adminService.updateAccountLock
);

module.exports = router;
