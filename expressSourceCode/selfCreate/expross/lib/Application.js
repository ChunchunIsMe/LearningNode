const http = require('http');
const middleware = require('./middleware/init');
const Router = require('./router');

class Application {
  constructor() {
    this.lazyrouter();
  }
  listen(port, cb) {
    const httpServer = http.createServer((req, res) => {
      this.handle(req, res);
    })
    return httpServer.listen(port, cb)
  }

  handle(req, res) {
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
    if (this._router) {
      this._router.handle(req, res, done)
    } else {
      done();
    }
  }

  use(path, fn) {
    if (typeof path === 'function') {
      fn = path;
      path = '/'
    }
    this._router.use(path, fn)
    return this;
  }

  lazyrouter() {
    if (!this._router) {
      this._router = new Router();
      this._router.use(middleware.init);
    }
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