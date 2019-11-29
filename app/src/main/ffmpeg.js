const { ipcMain } = require('electron'),
      ffmpegPath = require('ffmpeg-static-electron').path,
      ffmpeg = require('fluent-ffmpeg');
      
ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'));

const MemoryStream = require('memory-stream'),
      fs = require('fs'),
      main = require('./app'),
      log = require('electron-log');

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
      .on('end', () => main.send('record-response', key, false))
      .on('error', () => main.send('record-response', key, true))
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
      .on('end', () => {
        delete record[key];
        main.send('record-response', key, true);
      })
      .on('error', () => main.send('record-response', key, true))
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

ipcMain.on('screenshot', (event, key, x, y, width, height, path) => {
  ffmpeg()
    .fps(1)
    .videoFilters(`crop=${width}:${height}:${x}:${y}`)
    .input('desktop')
    .inputFormat('gdigrab')
    .outputOptions([
      '-vframes 1'
    ])
    .on('end', () => main.send('screenshot-response', key, false))
    .on('error', (err) => {
      log.error(err);
      main.send('screenshot-response', key, true);
    })
    .save(path);
});

ipcMain.on('screenshot-window', (event, key, windowName, path) => {
  ffmpeg()
    .fps(1)
    .input(`title=${windowName}`)
    .inputFormat('gdigrab')
    .outputOptions([
      '-vframes 1'
    ])
    .on('end', () => main.send('screenshot-response', key, false))
    .on('error', (err) => {
      log.error(err);
      main.send('screenshot-response', key, true);
    })
    .save(path);
});