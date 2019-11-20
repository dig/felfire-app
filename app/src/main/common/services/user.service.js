const { remote } = require('electron'),
      request = require('request'),
      authService = require('./auth.service'),
      apiURL = global.apiURL || remote.getGlobal('apiURL');

let user = null;

exports.getUser = () => {
  return user;
};

exports.setUser = (email, username, clear = true) => {
  let replacement = {
    email : email,
    username : username,
    fetchedImages : (clear || user == null ? [] : user.fetchedImages)
  };

  // if (!clear && user != null) replacement.fetchedImages = user.fetchedImages;

  user = replacement;
};

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

    request(options, (error, response, body) => {
      if (error || response.statusCode != 201) {
        return reject(error);
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

    request(options, (error, response, body) => {
      if (error || response.statusCode != 201) {
        return reject(error);
      }

      resolve();
    });
  });
};

exports.fetchImages = (page, count, cache = true) => {
  return new Promise((resolve, reject) => {
    if (user.fetchedImages[page] && cache) return resolve(user.fetchedImages[page]);

    const options = {
      method: 'GET',
      url: `${apiURL}/images`,
      form: {
        page: page,
        count: count
      },
      headers: {
        authorization: `Bearer ${authService.getAccessToken()}`
      },
      json: true,
    };

    request(options, (error, response, body) => {
      if (error || response.statusCode != 200) {
        return reject();
      }

      if (cache) user.fetchedImages[page] = body;
      resolve(body);
    });
  });
};