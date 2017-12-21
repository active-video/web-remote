//Add in the default port 8080 if none in arguments
if(process.argv.indexOf('-p') === -1) {
  process.argv.push('-p');
  process.argv.push('80');
}
console.log('process.argv %s', process.argv);

var app = require('./node_modules/cloudtv-remote-proxy/server.js');
var express = require('express');


app.use('/web-remote', express.static('./'))
