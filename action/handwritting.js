var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
const http = require('http');


const fs = require('fs')
const handwritten = require('handwritten.js')
var Minio = require('minio')

var minioClient = new Minio.Client({
   endPoint: '192.168.1.9',
   port: 9000,
   useSSL: false,
   accessKey: 'minioadmin',
   secretKey: 'minioadmin'
});

app.post('/init', function (req, res) {
   res.status(200).send();       
});
 
app.post('/run', function (req, res) {

   var meta = (req.body || {}).meta;
   var value = (req.body || {}).value;
   var payload = value.payload; 
   
   console.log('req body: ' + req.body)
   console.log('req: ' + req)   
   console.log('payload: ' + payload)
   
   if (typeof payload != 'string'){
      payload = JSON.stringify(payload);
   }
   
   
   filename = meta["filename"];
   var metaData = {
      'Content-Type': 'application/pdf',
      'X-Amz-Meta-filename': meta["filename"],
  }

   const downloadedfile = fs.createWriteStream(meta["filename"]);
   const request = http.get(payload, function(response) { // payload holds the presigned url inside it 
      response.pipe(downloadedfile);
      
      // Read the file  
      var file = fs.readFile(filename, 'utf8', function(err, file) {     
         if (err) throw err;  
         console.log('OK: ' + filename + ' ' + file);

         handwritten(file).then((convertedfile) => {
            convertedfile.pipe(fs.createWriteStream(filename.split(".")[0]+'.pdf'))
            console.log("The file was saved!");
  // Using fPutObject API upload your file to the bucket
  minioClient.fPutObject('handwritting', filename.split(".")[0]+'.pdf', "/usr/src/app/"+filename.split(".")[0]+'.pdf', metaData,  function(err, etag) {
   if (err) return console.log(err)
   console.log('File uploaded successfully.')
   res.send({ 'X-Amz-Content-success' : 'File uploaded successfully.' });
})
              
         });
      });
   });

 
        
 
});


 
app.listen(3000, function () {
})