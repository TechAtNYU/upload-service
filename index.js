'use strict';

var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs-extra');
var pkgcloud = require('pkgcloud');
var websitePath = 'http://images.tnyu.org/';

var rackspace = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: process.env.RackUN,
  apiKey: process.env.RackAPI,
  region: 'ORD'
});

// Function to easily generate a file path
function generateFilePath(uploadName, tmpPath) {
  var folderName = uploadName.split('.')[0];
  var extension = uploadName.split('.')[1];
  var splits = tmpPath.split('/');
  var tmpPathSplit = splits[splits.length-1];
  return tmpPathSplit + "_" + folderName + '.' + extension;
}

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

var uploadFile = function(fileName, toName){
  var readStream = fs.createReadStream(fileName);
  var writeStream = rackspace.upload({
    container: 'images',
    remote: toName
  });

  writeStream.on('error', function(err) {
    console.log(err);
  });

  writeStream.on('success', function(file) {
    console.log("done");
  });

  readStream.pipe(writeStream);
};

app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    var endFilePath = generateFilePath(files.upload.name, files.upload.path);
    var filePath = websitePath + endFilePath;
    res.end(JSON.stringify({
      'originalName': files.upload.name,
      'filePath': filePath
    }));
  });
  form.on('end', function() {
    var temporaryPath = this.openedFiles[0].path;
    var endFilePath = generateFilePath(this.openedFiles[0].name, temporaryPath);
    uploadFile(temporaryPath, endFilePath);
    fs.unlink(temporaryPath, function(err) {
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
