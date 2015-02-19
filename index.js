var express = require("express")
  , app = express()
  , formidable = require('formidable')
  , util = require('util')
  , fs   = require('fs-extra');

var websitePath = "http://services.tnyu.org"
  , pathToUploadDirectory = '/uploads/';

app.use("/uploads", express.static(__dirname + pathToUploadDirectory));

app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    var filePath = websitePath + pathToUploadDirectory + files["upload"]["name"]
    res.end(JSON.stringify({ "filePath": filePath }));
  });
  form.on('end', function(fields, files) {
    var temporaryPath = this.openedFiles[0].path;
    var setFileName = this.openedFiles[0].name;
    fs.copy(temporaryPath, pathToUploadDirectory + setFileName, function(err) {
      if (err) {
        console.error(err);
      }
    });
  });
});

// Show the upload form 
app.get('/simple-form', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post"><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
  res.end(form); 
});

app.listen(8080);