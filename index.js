var express = require("express")
  , app = express()
  , formidable = require('formidable')
  , fs   = require('fs-extra');

var websitePath = "http://services.tnyu.org"
  , pathToUploadDirectory = '/uploads/';
  
// Function to easily generate a file path
function generateFilePath(uploadName, uploadPath){
  var extension = uploadName.split(".")[1];
  var endFilePath = uploadPath.split("/")[2] + "." + extension;
  return endFilePath
}

app.use("/uploads", express.static(__dirname + pathToUploadDirectory));

app.post('/upload', function (req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    var endFilePath = generateFilePath(files["upload"]["name"], files["upload"]["path"])
    var filePath = websitePath + pathToUploadDirectory + endFilePath;
    res.end(JSON.stringify({ "filePath": filePath }));
  });
  form.on('end', function() {
    var temporaryPath = this.openedFiles[0].path;
    var endFilePath = generateFilePath(this.openedFiles[0].name, temporaryPath);
    fs.copy(temporaryPath, __dirname + pathToUploadDirectory + endFilePath, function(err) {
      if (err) {
        console.error(err);
      }
    });
  });
});

app.get('/simple-form', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  var form = '<form action="/upload" enctype="multipart/form-data" method="post"><input multiple="multiple" name="upload" type="file" /><br><br><input type="submit" value="Upload" /></form>';
  res.end(form); 
});

app.listen(8080);
