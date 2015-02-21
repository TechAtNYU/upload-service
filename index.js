'use strict';

var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs-extra');
var websitePath = 'http://services.tnyu.org';
var pathToUploadDirectory = '/uploads/';

// Function to easily generate a file path
function generateFilePath(uploadName, uploadPath) {
  var folderName = uploadName.split('.')[0];
  var extension = uploadName.split('.')[1];
  var endFilePath = uploadPath.split('/')[2].split('_')[1];
  return folderName + '_' + endFilePath + '.' + extension;
}

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
});

app.use('/uploads', express.static(__dirname + pathToUploadDirectory));

app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    var endFilePath = generateFilePath(files.upload.name, files.upload.path);
    var filePath = websitePath + pathToUploadDirectory + endFilePath;
    res.end(JSON.stringify({
      'originalName': files.upload.name,
      'filePath': filePath
    }));
  });
  form.on('end', function() {
    var temporaryPath = this.openedFiles[0].path;
    var endFilePath = generateFilePath(this.openedFiles[0].name, temporaryPath);
    var pathToMove = __dirname + pathToUploadDirectory + endFilePath;
    fs.copy(temporaryPath, pathToMove, function(err) {
      if (err) {
        console.error(err);
      }
    });
  });
});

app.get('/simple-form', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post">';
  form += '<input name="upload" type="file" /><input type="submit" value="Upload" />';
  form += '</form>';
  res.end(form);
});

app.get('/', function(req, res) {
  res.end('Tech@NYU image service');
});

app.listen(8080);
