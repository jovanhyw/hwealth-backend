const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

  if (account.twoFactorEnabled) {
    return res.status(400).send({
      error: true,
      message:
        'Two Factor Authentication is already enabled. Unable to generate a new secret.'
    });
  }

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
      try {
        const issuer = 'HWealth Backend Auth Service';
        const subject = account.username;
        const audience = 'hwealth';

        const payload = {
          accountid: account._id,
          username: account.username,
          twoFactorAuthenticated: true
        };
        const signOptions = {
          expiresIn: '10m',
          issuer,
          subject,
          audience
        };

        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, signOptions);
        res.status(200).send({
          error: false,
          message: 'Two Factor Authentication Success.',
          token: jwtToken
        });
      } catch (err) {
        // todo: log the error
        res.status(500).send({
          error: true,
          message: 'Internal Server Error. Unable to create token.'
        });
      }
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

        try {
          const issuer = 'HWealth Backend Auth Service';
          const subject = account.username;
          const audience = 'hwealth';

          const payload = {
            accountid: account._id,
            username: account.username,
            twoFactorAuthenticated: true
          };
          const signOptions = {
            expiresIn: '10m',
            issuer,
            subject,
            audience
          };

          const jwtToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            signOptions
          );

          res.status(200).send({
            error: false,
            message:
              'Two Factor Authentication Success. Two Factor Authentication has been enabled successfully.',
            valid: tokenValid,
            token: jwtToken
          });
        } catch (err) {
          res.status(500).send({
            error: true,
            message: 'Internal Server Error. Unable to create token.'
          });
        }
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

TwoFactorService.disable = async (req, res) => {
  // rmb to do input validation to take passwd
  const { error } = twoFactorGenSecretValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  const account = await Account.findById({ _id: req.account.accountid });

  if (!account.twoFactorEnabled) {
    return res.status(400).send({
      error: true,
      message: 'Two Factor Authentication is not enabled on this account.'
    });
  }

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  try {
    account.twoFactorEnabled = false;
    account.twoFactorSecret = null;
    await account.save();

    res.status(200).send({
      error: false,
      message: 'Two Factor Authentication has been disabled.'
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = TwoFactorService;
