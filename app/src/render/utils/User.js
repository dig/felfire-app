const remote = require('electron').remote,
    request = require('request'),
    apiURL = remote.getGlobal('apiURL');

const headers = {
  'Content-Type' : 'application/x-www-form-urlencoded' 
};

exports.assertAlive = (decoded) => {
  const now = Date.now().valueOf() / 1000;

  if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
    throw new Error(`token expired: ${JSON.stringify(decoded)}`)
  }

  if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
    throw new Error(`token not yet valid: ${JSON.stringify(decoded)}`)
  }
};

exports.createUser = (username, email, password, token) => {
  return new Promise((resolve, reject) => {
    request.post({url: `${apiURL}/users`, form: {
      username: username, 
      email: email, 
      password: password, 
      token: token
    }, headers: headers, json: true}, function(error, response, body) {
      if (error || response.statusCode != 201) {
        reject(body.errors || body.error || {});
      } else {
        resolve();
      }
    });
  });
};

exports.requestPasswordReset = (email, token) => {
  return new Promise((resolve, reject) => {
    request.post({url: `${apiURL}/users/forgot/password`, form: {email: email, token: token}, headers: headers, json: true}, function(error, response, body) {
      if (error || response.statusCode != 201) {
        reject(body.errors || body.error || {});
      } else {
        resolve();
      }
    });
  });
};