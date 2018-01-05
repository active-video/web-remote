//Add in the default port 8080 if none in arguments

const express = require('express');
const fs = require('fs');
const http = require('http');

var sslOptions;

//Setup SSL certificate
try {
  sslOptions = {
    key: fs.readFileSync('./ssl/webremote.key'),
    cert: fs.readFileSync('./ssl/webremote.cert')
  };
} catch (errorFallbackHttp) {
}

if (sslOptions && !process.env.SSL_KEY) {
  process.env.SSL_KEY = sslOptions.key;
}
if (sslOptions && !process.env.SSL_CERT) {
  process.env.SSL_CERT = sslOptions.cert;
}

//Some hosts like openode don't let you override PORT env var, so added SSL_PORT as alternate
if(process.env.SSL_PORT) {
  process.env.PORT = process.env.SSL_PORT;
}

console.log('PORT: %d', process.env.PORT);

if (!process.env.PORT) {
  console.log("Defaulting to port 80")
  process.env.PORT = 80;
}
console.log('PORT: %d', process.env.PORT);

const app = require('./node_modules/cloudtv-remote-proxy/server.js');
app.use('/web-remote', express.static('./'));


app.get('/env', function (req, res) {
  res.writeHeader('200', {
    'content-type': 'application/json',
    'cache-control': 'max-age=1'
  });

  res.end(JSON.stringify(process.env, '', '\t'));
});

function redirect(req, res){
  res.writeHead(302, {
    'Location': 'https://' + process.env.HOSTNAME + ':' + process.env.PORT + req.url
  });
  res.end();
}

if (sslOptions) {
  var altPort = process.env.ALTERNATE_PORT || 80;
  console.log("Starting up redirect on port: " + altPort);
  http.createServer(redirect).listen(altPort);
}
