const mongoose = require('mongoose');

const EmailTokenSchema = new mongoose.Schema({
  _accountId: {
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
    expires: 86400
  }
});

const EmailToken = mongoose.model('EmailToken', EmailTokenSchema);

module.exports = EmailToken;
