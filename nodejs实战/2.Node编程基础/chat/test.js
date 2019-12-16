
var http = require("http")
http.createServer(function (req, res) {//回调函数
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write("holloe  world")
  console.log(req.url);
  res.end("fdsa");
}).listen(3000);
