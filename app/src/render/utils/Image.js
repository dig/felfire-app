const { clipboard, remote, shell } = require('electron'),
      { app } = remote,
      userService = remote.require('./common/services/user.service');

const Jimp = require('jimp'),
      fs = require('fs-extra'),
      log = require('electron-log'),
      Store = require('electron-store');

const store = new Store();
const { MODE } = require('../constants/login.constants');

exports.getStreamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    let video = document.createElement('video');
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

    video.onloadedmetadata = () => {
      video.style.height = `${video.videoHeight}px`;
      video.style.width = `${video.videoWidth}px`;
      video.play();

      let canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let b64 = canvas.toDataURL('image/png');

      video.remove();
      try {
        stream.getTracks()[0].stop();
      } catch (e) {
        reject(e);
      }

      var data = b64.replace(/^data:image\/\w+;base64,/, "");
      var buffer = new Buffer(data, 'base64');
      resolve(buffer);
    };
    
    video.srcObject = stream;
    document.body.appendChild(video);
  });
};

exports.getBufferToJimp = async (buffer) => {
  return await Jimp.read(buffer);
};

exports.handleImageAfterCapture = (image) => {
  log.info(`exports.handleImageAfterCapture()`);
  return new Promise((resolve, reject) => {
    image.getBase64('image/png', (err, b64) => {
      if (err) return reject(err);

      if (store.get('mode', MODE.PREVIEW) === MODE.PREVIEW) {
        resolve({base64: b64});
      } else {
        exports.handleUpload(b64)
          .then(() => resolve({upload: true}))
          .catch((err) => reject(err));
      }
    });
  });
};

exports.handleUpload = (base64) => {
  log.info(`exports.handleUpload()`);
  return new Promise((resolve, reject) => {
    let imagePath = `${app.getPath('temp')}/felfire/${new Date().getTime()}.png`;

    fs.ensureDir(`${app.getPath('temp')}/felfire/`)
      .then(() => new Promise((resolve, reject) => {
        fs.writeFile(imagePath, base64.replace(/^data:image\/\w+;base64,/, ""), 'base64', (err) => {
          if (err) return reject(err);
          resolve();
        });
      }))
      .then(() => userService.upload(imagePath))
      .then((uploadData) => exports.handleImageOnUpload(uploadData))
      .then(() => fs.remove(imagePath))
      .then(() => resolve())
      .catch((err) => {
        exports.handleImageError('Unable to upload image, please try again.');
        reject(err);
      });
  });
};

exports.handleImageOnUpload = (uploadData) => {
  log.info(`exports.handleImageOnUpload()`);
  return new Promise((resolve, reject) => {
    new Notification('Upload complete!', {
      body: uploadData.url,
      icon: 'https://cdn.felfire.app/notification'
    });

    clipboard.writeText(uploadData.cdn_url, 'selection');
    shell.openExternal(uploadData.cdn_url);
    resolve();
  });
};

exports.handleImageError = (error) => {
  log.info(`exports.handleImageError(${error})`);
  new Notification('An error has occurred.', {
    body: error,
    icon: 'https://cdn.felfire.app/notification'
  });
};