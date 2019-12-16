var dgram = require('dgram');
var socket = dgram.createSocket('udp4');

socket.on("message", function (msg, rinfo) {
  console.log("server got: " + msg + " form " + rinfo.address + ":" + rinfo.port);
})

socket.on("listening", function () {
  var address = socket.address();
  console.log("server listening " + address.address + ":" + address.port);
})

socket.bind(41234);