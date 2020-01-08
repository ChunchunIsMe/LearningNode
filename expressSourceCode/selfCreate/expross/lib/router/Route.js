const http = require('http');
const Layer = require('./Layer');

class Route {
  constructor(path) {
    this.path = path;
    this.stack = [];
    this.methods = {}
  }
  _handles_method(method) {
    const name = method.toLowerCase();
    return Boolean(this.methods[name]);
  }
  dispatch(req, res, done) {
    let idx = 0;
    const method = req.method.toLowerCase();
    const stack = this.stack;
    function next(err) {
      if (err && err === 'route') {
        return done(err);
      }
      if (err && err === 'router') {
        return done(err);
      }
      if (idx >= stack.length) {
        return done(err);
      }
      const layer = stack[idx++];
      if (method !== layer.method) {
        return next(err);
      }

      if (err) {
        layer.handle_error(err, req, res, next);
      } else {
        layer.handle_requrest(req, res, next)
      }
    }
    next();
  }
}

http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Route.prototype[method] = function (fn) {
    const layer = new Layer('/', fn);
    layer.method = method;
    this.methods[method] = true;
    this.stack.push(layer);
    return this;
  }
})

module.exports = Route;