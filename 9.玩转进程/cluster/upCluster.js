var cluster = require('cluster');
var http = require('http');
var numCUPs = require('os').cpus().length;

if (cluster.isMaster) {
  for (var i = 0; i < numCUPs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function (worker, code, signal) {
    console.log('worker' + worker.process.pid + 'died');
  })
} else {
  http.createServer(function (req, res) {
    res.writeHead(200);
    res.end('hello world!\n');
  }).listen(8000)
}