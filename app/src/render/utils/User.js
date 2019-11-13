const remote = require('electron').remote,
    request = require('request'),
    apiURL = remote.getGlobal('apiURL');

exports.assertAlive = (decoded) => {
  const now = Date.now().valueOf() / 1000;

  if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
    throw new Error(`token expired: ${JSON.stringify(decoded)}`)
  }

  if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
    throw new Error(`token not yet valid: ${JSON.stringify(decoded)}`)
  }
};

exports.createUser = (username, email, password) => {
  return new Promise((resolve, reject) => {
    request.post({url: `${apiURL}/users`, form: {username: username, email: email, password: password}, json: true}, function(error, response, body) {
      if (error || response.statusCode != 201) {
        reject(body.errors);
      } else {
        resolve();
      }
    });
  });
};

exports.requestPasswordReset = (email) => {
  return new Promise((resolve, reject) => {
    request.post({url: `${apiURL}/users/forgot/password`, form: {email: email}, json: true}, function(error, response, body) {
      if (error || response.statusCode != 201) {
        reject(body.errors || {});
      } else {
        resolve();
      }
    });
  });
};

exports.login = (email, password) => {
  return new Promise((resolve, reject) => {
    request.post({url: `${apiURL}/authenticate`, form: {email: email, password: password}, json: true}, function(error, response, body) {
      if (error || response.statusCode != 201) {
        reject();
      } else {
        if (body.accessToken) {
          resolve({
            accessToken : body.accessToken,
            refreshToken : body.refreshToken
          });
        } else {
          resolve({
            email : body.email,
            verified : body.verified
          });
        }
      }
    });
  });
};

exports.refreshAccessToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    request({url: `${apiURL}/authenticate/refresh`, form: {refreshToken: refreshToken}, json: true}, function (error, response, body) {
      if (error || response.statusCode != 201 || body.accessToken == null) {
        reject();
      } else {
        resolve(body.accessToken);
      }
    });
 });
};