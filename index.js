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
    var extension = files["upload"]["name"].split(".")[1];
    var endFilePath = files["upload"]["path"].split("/")[2] + "." + extension;
    var filePath = websitePath + pathToUploadDirectory + endFilePath;
    res.end(JSON.stringify({ "filePath": filePath }));
  });
  form.on('end', function() {
    var temporaryPath = this.openedFiles[0].path;
    var extension = this.openedFiles[0].name.split(".")[1]
    var filePath = temporaryPath.split("/")[2] + "." + extension;
    fs.copy(temporaryPath, __dirname + pathToUploadDirectory + filePath, function(err) {
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
