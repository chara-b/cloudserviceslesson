var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

const handwritten = require('handwritten')
const fs = require('fs')
var Minio = require('minio')

var minioClient = new Minio.Client({
   endPoint: 'http://localhost',
   port: 9000,
   useSSL: false,
   accessKey: 'minioadmin',
   secretKey: 'minioadmin'
});

app.post('/init', function (req, res) {
   res.status(200).send();       
});
 
app.post('/run', function (req, res) {

    /*
   var meta = (req.body || {}).meta;
   var value = (req.body || {}).value;
   var payload = value.payload; 
   if (typeof payload != 'string')
      payload = JSON.stringify(payload);
   console.log("payload: " + payload);
   var result = { 'result' : { 'msg' : 'echo', 'payload' : payload} }; 
   res.status(200).json(result);*/
   var meta = (req.body || {}).meta;

   var value = (req.body || {}).value;
   var payload = value.payload; 
   if (typeof payload != 'string')
      payload = JSON.stringify(payload);

   // Make sure we got a filename on the command line.
   if (process.argv.length < 3) {
      console.log('Usage: node ' + process.argv[1] + ' FILENAME');
      process.exit(1);
   }
   // Read the file and print its contents. // index 0 is the node interpreter and index 1 is the script running on that nodeso index 2 is the actual parameter here 
   filename = process.argv[2];
   fs.readFile(filename, 'utf8', function(err, file) {
     if (err) throw err;
     console.log('OK: ' + filename);
     //console.log(data)
     handwritten(file).then((converted) => {
       //converted.pipe(fs.createWriteStream('output.pdf'))
       // Using fPutObject API upload your file to the bucket europetrip.
    minioClient.fPutObject('handwritting', process.argv[1], converted, meta, function(err, etag) {
      if (err) return console.log(err)
      console.log('File uploaded successfully.')
    });
   })
   });
});

 
app.listen(8080, function () {
})