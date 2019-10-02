const express = require('express');
const router = express.Router();
const stepsRecordService = require('../services/stepsrecord.service');

router.post('/', stepsRecordService.createStepsRecord);

module.exports = router;
