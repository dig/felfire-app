const { ipcMain } = require('electron'),
      ffmpegPath = require('ffmpeg-static-electron').path,
      ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const MemoryStream = require('memory-stream'),
      fs = require('fs'),
      main = require('./app');

let record = {};

ipcMain.on('record-start', (event, key, x, y, width, height, output = true, length = '0:15') => {
  let stream;
  let command;

  if (output instanceof Boolean) {
    stream = new MemoryStream();
    command = ffmpeg()
      .fps(15)
      .videoFilters(`crop=${width}:${height}:${x}:${y}`)
      .input('desktop')
      .inputFormat('gdigrab')
      .videoCodec('libx264rgb')
      .outputOptions([
        '-crf 0',
        '-preset ultrafast'
      ])
      .on('end', () => main.send('record-end', key))
      .on('error', () => main.send('record-error', key))
      .duration(length)
      .format('avi')
      .pipe(stream, { end: true });
  } else {
    stream = fs.createWriteStream(input);
    command = ffmpeg()
      .fps(15)
      .videoFilters(`crop=${width}:${height}:${x}:${y}`)
      .input('desktop')
      .inputFormat('gdigrab')
      .videoCodec('libx264rgb')
      .outputOptions([
        '-crf 0',
        '-preset ultrafast'
      ])
      .on('end', () => delete record[key])
      .on('error', () => main.send('record-error', key))
      .duration(length)
      .format('avi')
      .output(stream);
  }

  record[key] = {
    ffmpeg : command,
    stream : stream
  };
});

ipcMain.on('record-pause', (event, key) => record[key].ffmpeg.kill('SIGSTOP'));
ipcMain.on('record-resume', (event, key) => record[key].ffmpeg.kill('SIGCONT'));
ipcMain.on('record-kill', (event, key) => record[key].ffmpeg.kill());