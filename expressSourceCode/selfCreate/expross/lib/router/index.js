const http = require('http');
const Layer = require('./Layer');
const Route = require('./Route');

const proto = {
  route(path) {
    const route = new Route(path);
    const layer = new Layer(path, route.dispatch.bind(route))
    layer.route = route;
    this.stack.push(layer);
    return route;
  },
  handle(req, res, done) {
    let idx = 0;
    const method = req.method;
    const stack = this.stack;
    function next(err) {
      const layerError = (err === 'route' ? null : err);
      if (layerError === 'router') {
        return done(null);
      }
      if (idx >= stack.length || layerError) {
        return done(layerError);
      }
      const layer = stack[idx++];
      if (layer.match(req.url)) {
        if (!layer.route) {
          layer.handle_requrest(req, res, next)
        } else if (layer.route._handles_method(method)) {
          return layer.handle_requrest(req, res, next);
        }
      } else {
        layer.handle_error(layerError, req, res, next)
      }
    }
    next();
  },
  use(path, fn) {
    if (typeof path === 'function') {
      fn = path;
      path = '/'
    }
    const layer = new Layer(path, fn);
    layer.route = undefined;
    this.stack.push(layer);
    return this;
  }
};

http.METHODS.forEach(method => {
  method = method.toLowerCase();
  proto[method] = function (path, fn) {
    const route = this.route(path);
    route[method](fn);
    return this;
  }
})

module.exports = function () {
  function router(req, res, next) {
    router.handle(req, res, next);
  }
  Object.setPrototypeOf(router, proto);
  router.stack = [];
  return router;
};