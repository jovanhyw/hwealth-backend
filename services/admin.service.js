const Account = require('../models/Account');
const {
  updateEmailValidation,
  adminUpdateRoleValidation,
  adminUpdateLockValidation
} = require('../utils/validation');
const AdminService = {};

AdminService.searchForAccount = async (req, res) => {
  // input validation - email
  const { error } = updateEmailValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const account = await Account.findOne(
      { email: req.body.email },
      'username email verified role locked lockReason -_id'
    );

    if (!account)
      return res.status(404).send({
        error: true,
        message: 'No account associated with this email.'
      });

    res.status(200).send({
      error: false,
      account
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

AdminService.updateAccountRole = async (req, res) => {
  // input validation - enum(user/professional), email/accountid
  const { error } = adminUpdateRoleValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    if (req.body.role === 'Admin') {
      return res.status(400).send({
        error: true,
        message: 'Unable to update role to Admin.'
      });
    }

    const account = await Account.findOne({ email: req.body.email });

    try {
      account.role = req.body.role;
      await account.save();

      res.status(200).send({
        error: false,
        message: 'Account role updated successfully.',
        account: { email: account.email, role: account.role }
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

AdminService.updateAccountLock = async (req, res) => {
  // input validation - take in 0-unlock, 1-lock, lockReason
  const { error } = adminUpdateLockValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const account = await Account.findOne({ email: req.body.email });

    try {
      if (req.body.type === 0) {
        account.locked = false;
        account.lockReason = '';
        await account.save();

        return res.status(200).send({
          error: false,
          message: 'Account unlocked successfully.'
        });
      }

      if (req.body.type === 1) {
        account.locked = true;
        account.lockReason = req.body.lockReason;
        await account.save();

        return res.status(200).send({
          error: false,
          message: 'Account locked successfully.'
        });
      }
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = AdminService;
