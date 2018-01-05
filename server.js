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

console.log('PORT: %d', process.env.PORT);

if (!process.env.PORT) {
  process.env.PORT = 80;
}

const app = require('./node_modules/cloudtv-remote-proxy/server.js');
app.use('/web-remote', express.static('./'));


app.get('/env', function (req, res) {
  res.writeHeader('200', {
    'content-type': 'application/json',
    'cache-control': 'max-age=1'
  });

  res.end(JSON.stringify(process.env, '', '\t'));
});

if (sslOptions) {
  http.createServer((req, res) => {
    res.writeHead(302, {
      'Location': 'https://' + process.env.HOSTNAME + ':' + process.env.PORT + req.url
    });
    res.end();
  }).listen(process.env.ALTERNATE_PORT || 80);
}
