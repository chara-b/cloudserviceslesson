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
   
   const downloadedfile = fs.createWriteStream(meta["filename"]);
   const request = http.get(payload, function(response) { // payload holds the presigned url inside it 
      response.pipe(downloadedfile);
   });

   // Read the file 
   filename = meta["filename"];
   fs.readFile(filename, 'utf8', function(err, file) {
     
      if (err) throw err;
     
      console.log('OK: ' + filename);
      //console.log(data)

      handwritten(file).then((convertedfile) => {

         convertedfile.pipe(fs.createWriteStream(filename.split(".")[0]+'.pdf'))
   //   fs.writeFile("/usr/src/app/"+filename, convertedfile, function (err) {
      //   if (err) {
     //        return console.log(err);
     //    }
         console.log("The file was saved!");
     // });
      var metaData = {
         'Content-Type': 'application/pdf',
         'X-Amz-Meta-filename': meta["filename"],
     }
      // Using fPutObject API upload your file to the bucket
      minioClient.fPutObject('handwritting', filename.split(".")[0]+'.pdf', "/usr/src/app/"+filename.split(".")[0]+'.pdf', metaData,  function(err, etag) {
         if (err) return console.log(err)
         console.log('File uploaded successfully.')
     // res.status(200).json(result);
     // res.set({
      //   'Content-Type': 'application/json',
      //    'Authorization': 'Basic 23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP'
    //  })
         res.send({ 'X-Amz-Content-success' : 'File uploaded successfully.' });
      });
      })
   });
});

 
app.listen(3000, function () {
})