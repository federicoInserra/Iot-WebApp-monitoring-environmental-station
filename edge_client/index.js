
//import all the useful requirements
var express = require('express')
var fs = require('fs')
var https = require('https')

var app = express()

app.use(express.static('.'));
app.use(express.json());

// create an https server to access the sensors of the user
https.createServer({
  key: fs.readFileSync('certificates/server.key'),
  cert: fs.readFileSync('certificates/server.cert')
}, app)
.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})


// Use the sdk of AWS to connect and send data to the cloud 
var awsIot = require('aws-iot-device-sdk');
var device = awsIot.device({
    keyPath: "PRIVATE KEY PATH",
    certPath: "CERTIFICATE PATH",
      caPath: "CA PATH",
    clientId: "sensor-app",
        host: "ENDPOINT"
  });
  


  // Connect the device and prepare to send the data
  device
  .on('connect', function() {
    console.log('connect');
    
  });

  

// send the activity to the cloud
app.post('/sendActivity', (request, response) => {
  console.log("Received a request");
  console.log(request.body);

  
  device.publish('sensors', JSON.stringify(request.body));
 

  response.json({
    status: "success"
  });

});








