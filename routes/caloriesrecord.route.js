const express = require('express');
const router = express.Router();
const caloriesRecordService = require('../services/caloriesrecord.service');

router.post('/', caloriesRecordService.createCaloriesRecord);
router.get('/', caloriesRecordService.getAllCaloriesRecord);

module.exports = router;
