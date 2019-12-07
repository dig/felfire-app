const { ipcMain, webContents } = require('electron'),
      ffmpegPath = require('ffmpeg-static-electron').path,
      ffmpeg = require('fluent-ffmpeg');
      
ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'));

const MemoryStream = require('memory-stream'),
      fs = require('fs'),
      main = require('./app'),
      log = require('electron-log');

let record = {};

ipcMain.on('record-start', (event, key, x, y, width, height, output = true, length = '0:20', respondWindowId = -1) => {
  let stream;
  let command;

  let _respond = (status) => {
    if (respondWindowId > -1)
      webContents.fromId(respondWindowId).send('record-response', key, status)
  };

  if (output instanceof Boolean) {
    stream = new MemoryStream();
    command = ffmpeg()
      .fps(15)
      .videoFilters(
        `crop=${width}:${height}:${x}:${y}`,
        `pad=ceil(iw/2)*2:ceil(ih/2)*2`
      )
      .input('desktop')
      .inputFormat('gdigrab')
      .videoCodec('libx264rgb')
      .outputOptions([
        '-crf 0',
        '-preset ultrafast'
      ])
      .on('end', () => _respond(false))
      .on('error', () => _respond(true))
      .duration(length)
      .format('avi')
      .pipe(stream, { end: true });
  } else {
    stream = fs.createWriteStream(output);
    command = ffmpeg()
      .fps(15)
      .videoFilters(
        `crop=${width}:${height}:${x}:${y}`,
        `pad=ceil(iw/2)*2:ceil(ih/2)*2`
      )
      .input('desktop')
      .inputFormat('gdigrab')
      .videoCodec('libx264rgb')
      .outputOptions([
        '-crf 0',
        '-preset ultrafast'
      ])
      .on('end', () => {
        delete record[key];
        _respond(false);
      })
      .on('error', (err) => _respond(true))
      .duration(length)
      .format('avi')
      .save(stream);
  }

  record[key] = {
    ffmpeg : command,
    stream : stream
  };
});

ipcMain.on('record-render', (event, input, output, respondWindowId = -1) => {
  let _respond = (status) => {
    if (respondWindowId > -1)
      webContents.fromId(respondWindowId).send('record-render-response', status)
  };

  ffmpeg()
    .videoFilters('format=yuv420p')
    .input(input)
    .videoCodec('libx264')
    .outputOptions([
      '-crf 23',
      '-preset medium'
    ])
    .on('end', () => _respond(false))
    .on('error', (err) => _respond(true))
    .format('mp4')
    .save(output);
});

ipcMain.on('record-pause', (event, key) => {
  if (record[key]) record[key].ffmpeg.kill('SIGSTOP');
});

ipcMain.on('record-resume', (event, key) => {
  if (record[key]) record[key].ffmpeg.kill('SIGCONT');
});

ipcMain.on('record-kill', (event, key) => {
  if (record[key]) record[key].ffmpeg.kill();
});

ipcMain.on('screenshot', (event, key, x, y, width, height, path) => {
  ffmpeg()
    .fps(1)
    .videoFilters(`crop=${width}:${height}:${x}:${y}`)
    .input('desktop')
    .inputFormat('gdigrab')
    .inputOptions('-draw_mouse 0')
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
    .inputOptions('-draw_mouse 0')
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