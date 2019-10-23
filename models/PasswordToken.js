const mongoose = require('mongoose');

const PasswordTokenSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'Account'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600
  }
});

const PasswordToken = mongoose.model('PasswordToken', PasswordTokenSchema);

module.exports = PasswordToken;
