const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const TwoFactorService = {};

TwoFactorService.generateSecret = async (req, res) => {
  // rmb to do input validation to take passwd

  const account = await Account.findById({ _id: req.account.accountid });

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  const secret = speakeasy.generateSecret({ length: 20 });

  res.status(200).send({
    error: true,
    secret
  });
};

module.exports = TwoFactorService;
