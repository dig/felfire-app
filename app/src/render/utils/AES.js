const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    SITE_PUBLIC_KEY_1 = '76gUjz',
    SITE_PUBLIC_KEY_2 = 'LM3Z',
    SITE_PUBLIC_KEY_3 = 'DxUPU',
    SITE_PUBLIC_KEY_4 = 'eUnRj';

exports.encrypt = (text) => {
  let cipher = crypto.createCipher(algorithm, `${SITE_PUBLIC_KEY_1}${SITE_PUBLIC_KEY_4}${SITE_PUBLIC_KEY_2}${SITE_PUBLIC_KEY_3}`);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}