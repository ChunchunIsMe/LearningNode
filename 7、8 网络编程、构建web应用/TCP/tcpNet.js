var net = require('net');
var server = net.createServer(function (socket) {
  socket.on('data', function (...data) {
    console.log(data.toString());
    socket.write("你好");
  });
  socket.on('end', function () {
    console.log('server end');
  });
  socket.on('error', function (e) {
    console.log(e);
  })
  socket.write('大家都开始🌶！');
});

server.listen(8124, function (...data) {
  console.log(data);
  console.log("server bound");
});
