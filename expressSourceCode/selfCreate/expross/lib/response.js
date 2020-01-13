const http = require('http');
const res = Object.create(http.ServerResponse.prototype);

res.send = function (body) {
  this.writeHead(200, { 'Content-Type': 'text/plain' });
  this.end(body);
}
res.render = function (view, options, callback) {
  const app = this.req.app;
  const done = callback;
  const opts = options || {};
  done = done || ((err, str) => { if (err) { return this.req.next(err); } this.send(str) });
  app.render(view, opts, done);
}

module.exports = res;