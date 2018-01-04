//Add in the default port 8080 if none in arguments
if(process.argv.indexOf('-p') === -1) {
  process.argv.push('-p');
  process.argv.push('80');
}
console.log('process.argv %s', process.argv);

const app = require('./node_modules/cloudtv-remote-proxy/server.js');
const express = require('express');



app.use('/web-remote', express.static('./'))


app.get('/env', function(req, res){
  res.writeHeader('200', {
    'content-type' : 'application/json',
    'cache-control': 'max-age=1'
  });

  res.end(JSON.stringify(process.env, '', '\t'));
});
