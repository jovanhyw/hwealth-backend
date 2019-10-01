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

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  // login validated, create and assign jwt
  try {
    const issuer = 'HWealth Backend Auth Service';
    const subject = account.username;
    const audience = 'hwealth';

    const payload = { accountid: account._id, username: account.username };
    const signOptions = {
      expiresIn: '10m',
      issuer,
      subject,
      audience
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, signOptions);
    res.status(200).send({
      error: false,
      username: account.username,
      token: token
    });
  } catch (err) {
    // todo: log the error
    res.status(500).send({
      error: true,
      message: 'Internal Server Error. Unable to create token.'
    });
  }
};

AuthService.verifyToken = (req, res, next) => {
  // check if token is present in headers
  const bearerHeader = req.headers['authorization'];

  // if empty, throw error
  if (typeof bearerHeader === 'undefined')
    return res.status(401).send({
      error: true,
      message: 'Access Denied. Missing token in header.'
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
