const CaloriesRecord = require('../models/CaloriesRecord');
const CaloriesRecordService = {};
const { createCaloriesValidation } = require('../utils/validation');

CaloriesRecordService.createCaloriesRecord = async (req, res) => {
  // input validation
  const { error } = createCaloriesValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  let totalCalories = 0;
  const { foodEaten } = req.body;

  foodEaten.forEach(food => {
    totalCalories = totalCalories + food.calories;
  });

  const caloriesRecord = new CaloriesRecord({
    accountId: req.account.accountid,
    ...req.body,
    totalCalories
  });

  try {
    await caloriesRecord.save();

    res.status(201).send({
      error: false,
      message: 'Calories record created successfully.'
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to create calories record.'
    });
  }
};

CaloriesRecordService.getAllCaloriesRecord = async (req, res) => {
  try {
    const allRecords = await CaloriesRecord.find(
      { accountId: req.account.accountid },
      '_id dateRecorded mealType foodEaten totalCalories'
    ).sort({ dateRecorded: 'descending' });

    res.status(200).send({
      error: false,
      message: 'Calories records retrieved successfully.',
      records: allRecords
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to retrieve calories records.'
    });
  }
};

CaloriesRecordService.updateCaloriesRecord = async (req, res) => {
  // input validation

  let totalCalories = 0;
  const { foodEaten } = req.body;

  foodEaten.forEach(food => {
    totalCalories = totalCalories + food.calories;
  });

  try {
    const record = await CaloriesRecord.findById({ _id: req.params.id });

    if (req.account.accountid !== record.accountId.toString())
      return res.status(403).send({
        error: true,
        message: 'You are not authorized to make a change to this record.'
      });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to update calories record.'
    });
  }

  try {
    const updated = await CaloriesRecord.findByIdAndUpdate(
      { _id: req.params.id },
      { ...req.body, totalCalories },
      {
        new: true,
        fields: '_id dateRecorded mealType foodEaten totalCalories'
      }
    );

    res.status(200).send({
      error: false,
      message: 'Calories record updated successfully.',
      record: updated
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to update steps record.'
    });
  }
};

CaloriesRecordService.deleteCaloriesRecord = async (req, res) => {
  try {
    const record = await CaloriesRecord.findById({ _id: req.params.id });

    if (req.account.accountid !== record.accountId.toString())
      return res.status(403).send({
        error: true,
        message: 'You are not authorized to delete this record.'
      });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to delete steps record.'
    });
  }

  try {
    await CaloriesRecord.findByIdAndDelete({ _id: req.params.id });

    res.status(200).send({
      error: false,
      message: 'Calories record deleted successfully.'
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error. Failed to delete calories record.'
    });
  }
};

module.exports = CaloriesRecordService;
