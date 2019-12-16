var child1 = require('child_process').fork('child.js');
var child2 = require('child_process').fork('child.js');

var server = require('net').createServer();
server.on('connection', function (socket) {
  socket.end('handle by parent.\n');
})

server.listen(1377, function () {
  child1.send('server', server);
  child2.send('server', server);
})