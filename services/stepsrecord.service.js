const StepsRecord = require('../models/StepsRecord');
const StepsRecordService = {};

StepsRecordService.createStepsRecord = async (req, res) => {
  // input validation

  const stepsRecord = new StepsRecord({
    accountId: req.account.accountid,
    ...req.body
  });

  try {
    await stepsRecord.save();

    res.status(201).send({
      error: false,
      message: 'Steps record created successfully.'
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to create steps record.'
    });
  }
};

module.exports = StepsRecordService;
