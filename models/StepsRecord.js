const mongoose = require('mongoose');

const StepsRecordSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  dateRecorded: {
    type: Date,
    required: true,
    trim: true
  },
  totalSteps: {
    type: Number,
    required: true,
    trim: true
  }
});

StepsRecordSchema.set('timestamps', true);

const StepsRecord = mongoose.model('StepsRecord', StepsRecordSchema);

module.exports = StepsRecord;
