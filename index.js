'use strict';

var fs = require('fs-extra');
var util = require('util');
var express = require('express');
var formidable = require('formidable');
var pkgcloud = require('pkgcloud');

var app = express();
var websitePath = process.env.ImageWebsitePath;
var rackspace = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: process.env.RackUN,
  apiKey: process.env.RackAPI,
  region: process.env.RackRegion
});

// Function to easily generate a file path
var generateFilePath = function(uploadName, tmpPath) {
  var folderName = uploadName.split('.')[0];
  var extension = uploadName.split('.')[1];
  var splits = tmpPath.split('/');
  var tmpPathSplit = splits[splits.length - 1];
  return tmpPathSplit + '_' + folderName + '.' + extension;
};

// Upload file onto Rackspace
var uploadFile = function(req, res, temporaryName, temporaryPath) {
  var endFilePath = generateFilePath(temporaryName, temporaryPath);
  var readStream = fs.createReadStream(temporaryPath);
  var writeStream = rackspace.upload({
    container: 'images',
    remote: endFilePath
  });

  writeStream.on('error', function(err) {
    res.writeHead(500, {'content-type': 'text/plain'});
    res.end('error:\n\n' + util.inspect(err));
    console.error(err);
  });

  writeStream.on('success', function(file) {
    fs.unlink(temporaryPath, function(err) {
      if (err) {
        console.error(err);
      }
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      'originalName': temporaryName,
      'filePath': websitePath + endFilePath
    }));
  });
  readStream.pipe(writeStream);
};

// Enable CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
});

// Upload route
app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.on('end', function() {
    var temporaryName = this.openedFiles[0].name;
    var temporaryPath = this.openedFiles[0].path;
    uploadFile(req, res, temporaryName, temporaryPath);
  });
  form.on('error', function(err) {
    res.writeHead(500, {'content-type': 'text/plain'});
    res.end('error:\n\n' + util.inspect(err));
    console.error(err);
  });
  form.parse(req);
});

// Simple form route
app.get('/simple-form', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  var form = '<form action="' + process.env.BasePath + '/upload" enctype="multipart/form-data" method="post">';
  form += '<input name="upload" type="file" /><input type="submit" value="Upload" />';
  form += '</form>';
  res.end(form);
});

app.get('/', function(req, res) {
  res.end(process.env.ServiceName + ' image service');
});

app.listen(8080);
