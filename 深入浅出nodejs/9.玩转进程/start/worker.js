#!/usr/bin/env node

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Hello World!\n');
}).listen(Math.floor((1 + Math.random()) * 1000), '127.0.0.1');