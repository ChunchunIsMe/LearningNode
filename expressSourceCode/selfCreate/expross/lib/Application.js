const http = require('http');
const middleware = require('./middleware/init');
const Router = require('./router');
const View = require('./view');

class Application {
  constructor() {
    this.lazyrouter();
    this.settings = {};
    this.engines = {};
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
      this._router.use(middleware.init(this));
    }
  }

  set(setting, val) {
    if (arguments.length === 1) {
      return this.settings[setting];
    }
    this.settings[setting] = val;
    return this;
  }

  engine(ext, fn) {
    const extension = ext[0] !== '.' ? '.' + ext : ext;
    this.engines[extension] = fn;
    return this;
  }

  render(name, options, callback) {
    const done = callback;
    const engines = this.engines;
    view = new View(name, {
      defaultEngine: this.get('view engine'),
      root: this.get('views'),
      engines
    })
    if (!view.path) {
      const err = new Error(`Failed to lookup view "${name}"`)
      return done(err);
    }
    try {
      view.render(options, callback);
    } catch (e) {
      callback(e)
    }
  }
}
http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Application.prototype[method] = function (path, fn) {
    if (method === 'get' && arguments.length === 1) {
      return this.set(path)
    }
    this._router[method].call(this._router, path, fn)
    return this;
  }

})
module.exports = Application;