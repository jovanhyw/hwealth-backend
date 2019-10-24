const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const { twoFactorGenSecretValidation } = require('../utils/validation');
const TwoFactorService = {};

TwoFactorService.generateSecret = async (req, res) => {
  // rmb to do input validation to take passwd
  const { error } = twoFactorGenSecretValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  const account = await Account.findById({ _id: req.account.accountid });

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  try {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: account.username,
      issuer: 'HWealth'
    });

    secret.otpauth_url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: encodeURIComponent(account.username),
      issuer: 'HWealth',
      encoding: 'base32'
    });

    res.status(200).send({
      error: false,
      secret
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

TwoFactorService.authenticate = async (req, res) => {
  // input validation

  try {
    const account = await Account.findById({ _id: req.account.accountid });

    const tokenValid = speakeasy.totp.verify({
      secret: account.twoFactorSecret,
      encoding: 'base32',
      token: req.body.token
    });

    if (tokenValid) {
      res.status(200).send({
        error: false,
        message: 'Two Factor Authentication Success.',
        valid: tokenValid
      });
    } else {
      res.status(401).send({
        error: true,
        message: 'Two Factor Authentication Failed.',
        valid: tokenValid
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

TwoFactorService.enable = async (req, res) => {
  // input validation

  try {
    const tokenValid = speakeasy.totp.verify({
      secret: req.body.secret,
      encoding: 'base32',
      token: req.body.token
    });

    const account = await Account.findById({ _id: req.account.accountid });

    if (tokenValid) {
      account.twoFactorSecret = req.body.secret;
      account.twoFactorEnabled = true;
      // account.twoFactorRecoveryCode = ?
      try {
        await account.save();

        res.status(200).send({
          error: false,
          message:
            'Two Factor Authentication Success. Two Factor Authentication is enabled.',
          valid: tokenValid
        });
      } catch (err) {
        res.status(500).send({
          error: true,
          message: 'Internal Server Error.'
        });
      }
    } else {
      res.status(401).send({
        error: true,
        message: 'Two Factor Authentication Failed. Please re-challenge.',
        valid: tokenValid
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = TwoFactorService;
