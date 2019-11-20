const { remote } = require('electron'),
      jwtDecode = require('jwt-decode'),
      request = require('request'),
      url = require('url'),
      keytar = require('keytar'),
      os = require('os'),
      apiURL = global.apiURL || remote.getGlobal('apiURL');

const keytarService = 'felfire-auth';
const keytarAccount = os.userInfo().username;

let accessToken = null;
let refreshToken = null;

exports.getAccessToken = () => {
  return accessToken;
}

exports.refreshAccessToken = () => {
  return new Promise(async (resolve, reject) => {
    const refreshToken = await keytar.getPassword(keytarService, keytarAccount);
    if (!refreshToken) return reject();

    const refreshOptions = {
      method: 'GET',
      url: `${apiURL}/authenticate/refresh`,
      form: {
        refreshToken: refreshToken
      },
      json: true,
    };

    request(refreshOptions, async function (error, response, body) {
      if (error || body.error || body.errors || response.statusCode != 201) {
        await logout();
        return reject(error || body.error || body.errors);
      }

      accessToken = body.accessToken;
      resolve();
    });
  });
}

exports.login = (email, password) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: `${apiURL}/authenticate`,
      form: {
        email: email,
        password: password
      },
      json: true,
    };

    request(options, async (error, response, body) => {
      if (error || body.error || response.statusCode != 201) {
        await exports.logout();
        return reject(error || body.error);
      }

      if (body.refreshToken) {
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
      } else {
        resolve({
          email : body.email,
          verified : false
        });
      }

      keytar.setPassword(keytarService, keytarAccount, refreshToken);
      resolve();
    });
  });
}

exports.logout = async () => {
  await keytar.deletePassword(keytarService, keytarAccount);
  accessToken = null;
  refreshToken = null;
}