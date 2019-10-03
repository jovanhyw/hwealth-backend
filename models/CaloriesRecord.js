const mongoose = require('mongoose');

const CaloriesRecordSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  dateRecorded: {
    type: Date,
    required: true,
    trim: true
  },
  mealType: {
    type: String,
    required: true,
    trim: true
  },
  foodEaten: {
    type: Array,
    required: true
  },
  totalCalories: {
    type: Number,
    trim: true
  }
});

CaloriesRecordSchema.set('timestamps', true);

const CaloriesRecord = mongoose.model('CaloriesRecord', CaloriesRecordSchema);

module.exports = CaloriesRecord;
