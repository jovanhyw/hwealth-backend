const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const {
  twoFactorGenSecretValidation,
  twoFactorAuthenticateValidation,
  twoFactorEnableValidation,
  twoFactorRecoverValidation
} = require('../utils/validation');
const generateRecoveryCode = require('../utils/generateRecoveryCode');
const TwoFactorService = {};
const encryptionHelper = require('../utils/encryptionUtil');

TwoFactorService.generateSecret = async (req, res) => {
  // input validation for password
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
  const { error } = twoFactorAuthenticateValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const account = await Account.findById({ _id: req.account.accountid });

    let decryptedSecret = null;

    // decrypt the 2FA secret
    try {
      decryptedSecret = encryptionHelper.decrypt(
        account.twoFactorSecret,
        process.env.ENC_KEY_TFA
      );
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
      });
    }

    const tokenValid = speakeasy.totp.verify({
      secret: decryptedSecret,
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

        let encryptedJwt = null;

        // encrypt the jwt
        try {
          encryptedJwt = encryptionHelper.encrypt(
            jwtToken,
            process.env.ENC_KEY_JWT
          );
        } catch (err) {
          res.status(500).send({
            error: true,
            message: 'Internal Server Error.'
          });
        }

        res.status(200).send({
          error: false,
          message: 'Two Factor Authentication Success.',
          token: encryptedJwt
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
  const { error } = twoFactorEnableValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const tokenValid = speakeasy.totp.verify({
      secret: req.body.secret,
      encoding: 'base32',
      token: req.body.token
    });

    const account = await Account.findById({ _id: req.account.accountid });

    if (tokenValid) {
      const recoveryCodeFriendly = generateRecoveryCode(32);
      const recoveryCode = recoveryCodeFriendly.replace(/ +/g, '');

      let encryptedSecret = null;
      let encryptedRecoveryCode = null;

      // encrypt the secret before saving to db
      try {
        encryptedSecret = encryptionHelper.encrypt(
          req.body.secret,
          process.env.ENC_KEY_TFA
        );
      } catch (err) {
        // error in encryption, but we don't want to
        // let the end user know this so just throw 500
        // by right we should log all errors as well
        res.status(500).send({
          error: true,
          message: 'Internal Server Error.'
        });
      }

      // encrypt the rec code before saving to db
      try {
        encryptedRecoveryCode = encryptionHelper.encrypt(
          recoveryCode,
          process.env.ENC_KEY_TFA_REC_CODE
        );
      } catch (err) {
        // error in encryption, but we don't want to
        // let the end user know this so just throw 500
        // by right we should log all errors as well
        res.status(500).send({
          error: true,
          message: 'Internal Server Error.'
        });
      }

      account.twoFactorSecret = encryptedSecret;
      account.twoFactorEnabled = true;
      account.twoFactorRecoveryCode = encryptedRecoveryCode;
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

          let encryptedJwt = null;

          // encrypt the jwt
          try {
            encryptedJwt = encryptionHelper.encrypt(
              jwtToken,
              process.env.ENC_KEY_JWT
            );
          } catch (err) {
            res.status(500).send({
              error: true,
              message: 'Internal Server Error.'
            });
          }

          res.status(200).send({
            error: false,
            message:
              'Two Factor Authentication Success. Two Factor Authentication has been enabled successfully.',
            valid: tokenValid,
            token: encryptedJwt,
            recoveryCode: recoveryCodeFriendly
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
  // input validation
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
    account.twoFactorRecoveryCode = null;
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

TwoFactorService.getRecoveryCode = async (req, res) => {
  try {
    const account = await Account.findById({ _id: req.account.accountid });

    if (!account.twoFactorEnabled || !account.twoFactorRecoveryCode) {
      return res.status(404).send({
        error: true,
        message:
          'Two Factor Authentication recovery code not found on this account.'
      });
    }

    let decryptedRecCode = null;
    // decrypt the recovery code
    try {
      decryptedRecCode = encryptionHelper.decrypt(
        account.twoFactorRecoveryCode,
        process.env.ENC_KEY_TFA_REC_CODE
      );
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
      });
    }

    const recoveryCodeFriendly = decryptedRecCode
      .replace(/(.{4})/g, '$1 ')
      .trim();

    res.status(200).send({
      error: false,
      recoveryCode: recoveryCodeFriendly
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

TwoFactorService.recover = async (req, res) => {
  // input validation
  const { error } = twoFactorRecoverValidation(req.body);
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

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  // check if recovery code matches
  const recoveryCodeFriendly = req.body.recoveryCode;
  const recoveryCode = recoveryCodeFriendly.replace(/ +/g, '');

  let decryptedRecCode = null;
  // decrypt the recovery code
  try {
    decryptedRecCode = encryptionHelper.decrypt(
      account.twoFactorRecoveryCode,
      process.env.ENC_KEY_TFA_REC_CODE
    );
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }

  if (recoveryCode !== decryptedRecCode) {
    return res.status(401).send({
      error: true,
      message: 'Recovery Code do not match.'
    });
  }

  try {
    account.twoFactorEnabled = false;
    account.twoFactorSecret = null;
    account.twoFactorRecoveryCode = null;
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
