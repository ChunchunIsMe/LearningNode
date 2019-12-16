var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('handled by child, pid is ' + process.pid + '\n');
})

process.on('message', function (m, tcp) {
  if (m === 'server') {
    console.log(process.pid);
    tcp.on('connection', function (socket) {
      server.emit('connection', socket);
    })
  }
})