const http = require('http');
const Router = require('./router');

class Application {
  constructor() {
    this._router = new Router();
  }
  listen(port, cb) {
    const httpServer = http.createServer((req, res) => {
      this.handle(req, res);
    })
    return httpServer.listen(port, cb)
  }

  handle(req, res) {
    if (!res.send) {
      res.send = function (body) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(body);
      }
    }
    this._router.handle(req, res)
  }
}
http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Application.prototype[method] = function (path, fn) {
    this._router[method].call(this._router, path, fn)
    return this;
  }

})
module.exports = Application;