const axios = require('axios');
const CaptchaService = {};

CaptchaService.verifyCaptcha = async (req, res) => {
  let urlEncodedData =
    'secret=' +
    process.env.CAPTCHA_ANDROID_SECRET_KEY +
    '&response=' +
    req.body.captchaResponse +
    '&remoteip=' +
    req.connection.remoteAddress;

  axios
    .post('https://www.google.com/recaptcha/api/siteverify', urlEncodedData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      if (response.data.success) {
        res.status(200).send({
          ...response.data
        });
      } else {
        res.status(401).send({ ...response.data });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(401).send({ ...response.data });
    });
};

CaptchaService.verifyCaptchaWebV3 = async (req, res) => {
  const RECAPTCHA_SCORE_THRESHOLD = 0.5;

  let urlEncodedData =
    'secret=' +
    process.env.CAPTCHA_WEB_SECRET_KEY +
    '&response=' +
    req.body.captchaResponse +
    '&remoteip=' +
    req.connection.remoteAddress;

  axios
    .post('https://www.google.com/recaptcha/api/siteverify', urlEncodedData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      if (response.data.success) {
        // success, check score
        // google says default threshold 0.5 is ok
        // score of 1.0 = good interaction
        // score of 0.0 likely is bot
        // console.log(response.data.score);

        // good score
        if (response.data.score >= RECAPTCHA_SCORE_THRESHOLD) {
          return res.status(200).send({
            error: false,
            message: 'Success!'
          });
        } else {
          // bad score (below 0.5)
          // smoke the frontend. incase it's a spam bot
          return res.status(200).send({
            error: false,
            message: 'Success'
          });
        }
      } else {
        // google return success as false
        // smoke the frontend incase it's a bot
        // so return as 200 success
        return res.status(200).send({
          error: false,
          message: 'Success.'
        });
      }
    })
    .catch(() => {
      // received err from google
      // return bad request to frontend
      // but dont tell error
      res.status(400).send({
        error: true,
        message: 'Bad request.'
      });
    });
};

module.exports = CaptchaService;
