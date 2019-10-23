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

module.exports = CaptchaService;
