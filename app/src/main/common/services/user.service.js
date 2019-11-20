const { remote } = require('electron'),
      request = require('request'),
      authService = require('./auth.service'),
      apiURL = global.apiURL || remote.getGlobal('apiURL');

exports.createUser = (username, email, password, captchaResponse) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `${apiURL}/users`,
      form: {
        username: username,
        email: email,
        password: password,
        token: captchaResponse
      },
      json: true,
    };

    request(options, async (error, response, body) => {
      if (error || body.error || body.errors || response.statusCode != 201) {
        return reject(error || body.error || body.errors);
      }

      resolve();
    });
  });
};

exports.forgotPassword = (email, captchaResponse) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `${apiURL}/users/forgot/password`,
      form: {
        email: email,
        token: captchaResponse
      },
      json: true,
    };

    request(options, async (error, response, body) => {
      if (error || body.error || body.errors || response.statusCode != 201) {
        return reject(error || body.error || body.errors);
      }

      resolve();
    });
  });
};