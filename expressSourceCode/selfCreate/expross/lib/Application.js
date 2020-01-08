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
    const done = (err) => {
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      })
      if (err) {
        res.end('404' + err);
      } else {
        const msg = 'Can not ' + req.method + ' ' + req.url;
        res.end(msg)
      }
    }
    this._router.handle(req, res, done)
  }

  use(path, fn) {
    const router = this._router;
    if (typeof path === 'function') {
      fn = path;
      path = '/'
    }
    router.use(path, fn)
    return this;
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