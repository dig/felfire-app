const Jimp = require('jimp');

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