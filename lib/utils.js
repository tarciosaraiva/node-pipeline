'use strict';

var crypto = require('crypto');

module.exports.compare = function (a, b) {
  a = parseInt(a, 10), b = parseInt(b, 10);
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

module.exports.hexToRgb = function (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {
    r: 0x00,
    g: 0x00,
    b: 0x00
  };
};

module.exports.encrypt = function (data) {
  var cipher = crypto.createCipher('aes256', 'raspberrypi');
  cipher.end(data, 'utf8');
  return cipher.read().toString('hex');
};

module.exports.decrypt = function (encryptedData) {
  var decipher = crypto.createDecipher('aes256', 'raspberrypi');
  decipher.end(encryptedData, 'hex');
  return decipher.read().toString();
};