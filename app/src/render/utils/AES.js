const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    SITE_PUBLIC_KEY = '76gUjzeUnRjLM3ZDxUPU';

exports.encrypt = (text) => {
  var cipher = crypto.createCipher(algorithm, SITE_PUBLIC_KEY);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}