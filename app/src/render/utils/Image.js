const { clipboard, remote, shell } = require('electron'),
      userService = remote.require('./common/services/user.service');

const fs = require('fs-extra'),
      log = require('electron-log');

exports.handleUpload = async (imagePath) => {
  try {
    let uploadData = await userService.upload(imagePath);
    exports.handleImageOnUpload(uploadData);

    await fs.remove(imagePath);
  } catch (err) {
    log.error(err);
    exports.handleImageError('Unable to upload image, please try again.');
  }
};

exports.handleImageOnUpload = (uploadData) => {
  new Notification('Upload complete!', {
    body: uploadData.url,
    icon: 'https://cdn.felfire.app/notification.png',
    tag: 'FelFire'
  });

  clipboard.writeText(uploadData.cdn_url, 'selection');
  shell.openExternal(uploadData.cdn_url);
};

exports.handleImageError = (error) => {
  new Notification('An error has occurred.', {
    body: error,
    icon: 'https://cdn.felfire.app/notification.png',
    tag: 'FelFire'
  });
};