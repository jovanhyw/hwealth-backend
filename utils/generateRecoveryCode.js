const crypto = require('crypto');

//function code taken from http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
const generateRecoveryCode = length => {
  const randomHex = len => {
    return crypto
      .randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len)
      .toUpperCase(); // return required number of characters
  };

  let code = '';
  for (i = 0; i < length / 4; i++) {
    code += randomHex(4) + ' ';
  }

  return (code = code.trim());
};

module.exports = generateRecoveryCode;
