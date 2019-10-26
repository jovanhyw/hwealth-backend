const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = {};
const { loginValidation } = require('../utils/validation');

AuthService.login = async (req, res) => {
  // login input validation
  const { error } = loginValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  // check if username exists in db
  const account = await Account.findOne({ username: req.body.username });
  if (!account)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  // check if account is locked
  if (account.locked) {
    return res.status(401).send({
      error: true,
      message:
        'Your account has been locked. Please contact support for further instructions.'
    });
  }

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass) {
    try {
      account.failedLoginAttempts += 1;

      // if login attempts = 10, lock the account
      if (account.failedLoginAttempts >= 10) {
        account.locked = true;
        account.lockReason = 'Max login attempts.';
      }

      await account.save();

      return res.status(401).send({
        error: true,
        message: 'Authentication failed.'
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
      });
    }
  }

  // check if email is verified
  if (!account.verified)
    return res.status(401).send({
      error: true,
      message:
        'Your email is not verified. Please follow the link sent to your email address that is associated with this account.'
    });

  // login validated, create and assign jwt
  try {
    const issuer = 'HWealth Backend Auth Service';
    const subject = account.username;
    const audience = 'hwealth';

    const payload = {
      accountid: account._id,
      username: account.username,
      twoFactorAuthenticated: false
    };
    const signOptions = {
      expiresIn: '10m',
      issuer,
      subject,
      audience
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, signOptions);

    try {
      account.failedLoginAttempts = 0;
      await account.save();
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
      });
    }

    res.status(200).send({
      error: false,
      username: account.username,
      token: token,
      twoFactorEnabled: account.twoFactorEnabled
    });
  } catch (err) {
    // todo: log the error
    res.status(500).send({
      error: true,
      message: 'Internal Server Error. Unable to create token.'
    });
  }
};

AuthService.verifyToken = async (req, res, next) => {
  // check if token is present in headers
  const bearerHeader = req.headers['authorization'];

  // if empty, throw error
  if (typeof bearerHeader === 'undefined')
    return res.status(401).send({
      error: true,
      message: 'Access Denied. Missing token in header.'
    });

  if (!bearerHeader.startsWith('Bearer '))
    return res.status(400).send({
      error: true,
      message:
        'Bad headers. Please ensure you are following the Bearer Authorization Pattern.'
    });

  try {
    // split bearer at space...format is "Bearer {token}"
    const bearer = bearerHeader.split(' ');

    // get token from array[1] that we split
    const bearerToken = bearer[1];

    // verify the token
    const verified = jwt.verify(bearerToken, process.env.JWT_SECRET);

    try {
      const account = await Account.findById({ _id: verified.accountid });

      if (account.twoFactorEnabled && !verified.twoFactorAuthenticated) {
        return res.status(401).send({
          error: true,
          message:
            'Two Factor Authentication is enabled but Two Factor Authentication has not passed.'
        });
      }
    } catch (err) {
      res.status(404).send({
        error: true,
        message: 'Account ID not found.'
      });
    }

    req.account = verified;
    next();
  } catch (err) {
    res.status(401).send({
      error: true,
      message: 'Invalid token.'
    });
  }
};

AuthService.verifyPreToken = async (req, res, next) => {
  // check if token is present in headers
  const bearerHeader = req.headers['authorization'];

  // if empty, throw error
  if (typeof bearerHeader === 'undefined')
    return res.status(401).send({
      error: true,
      message: 'Access Denied. Missing token in header.'
    });

  if (!bearerHeader.startsWith('Bearer '))
    return res.status(400).send({
      error: true,
      message:
        'Bad headers. Please ensure you are following the Bearer Authorization Pattern.'
    });

  try {
    // split bearer at space...format is "Bearer {token}"
    const bearer = bearerHeader.split(' ');

    // get token from array[1] that we split
    const bearerToken = bearer[1];

    // verify the token
    const verified = jwt.verify(bearerToken, process.env.JWT_SECRET);

    req.account = verified;
    next();
  } catch (err) {
    res.status(401).send({
      error: true,
      message: 'Invalid token.'
    });
  }
};

module.exports = AuthService;
