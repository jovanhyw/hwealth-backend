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

StepsRecordService.getAllStepsRecord = async (req, res) => {
  try {
    const allRecords = await StepsRecord.find(
      {
        accountId: req.account.accountid
      },
      'dateRecorded totalSteps -_id'
    ).sort({ dateRecorded: 'descending' });

    res.status(200).send({
      error: false,
      message: 'Steps Records retrieved successfully.',
      records: allRecords
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to retrieve steps record.'
    });
  }
};

StepsRecordService.updateStepsRecord = async (req, res) => {
  // input validation

  try {
    const record = await StepsRecord.findById({ _id: req.params.id });

    if (req.account.accountid !== record.accountId.toString())
      return res.status(403).send({
        error: true,
        message: 'You are not authorized to make a change to this record.'
      });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to retrieve steps record.'
    });
  }

  try {
    const updated = await StepsRecord.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    res.status(200).send({
      error: false,
      message: 'Steps Records updated successfully.',
      record: updated
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to retrieve steps record.'
    });
  }
};

module.exports = StepsRecordService;
