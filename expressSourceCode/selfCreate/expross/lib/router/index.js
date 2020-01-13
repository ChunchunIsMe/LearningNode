const http = require('http');
const url = require('url');
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
    let removed = '';
    let slashAdded = false;
    const parentUrl = req.baseUrl || '';

    req.baseUrl = parentUrl;

    req.orginalUrl = req.orginalUrl || req.url;

    function next(err) {
      const layerError = (err === 'route' ? null : err);

      if (slashAdded) {
        req.url = '';
        slashAdded = false;
      }

      if (removed.length !== 0) {
        req.baseUrl = parentUrl;
        req.url = removed + req.url;
        removed = '';
      }

      if (layerError === 'router') {
        return done(null);
      }
      if (idx >= stack.length) {
        return done(layerError);
      }

      const path = url.parse(req.url).pathname;
      const layer = stack[idx++];
      debugger;
      if (layer.match(path)) {

        if (!layer.route) {
          removed = layer.path;
          req.url = req.url.substr(removed.length);
          if (req.url === '') {
            req.url = '/' + req.url;
            slashAdded = true;
          }

          req.baseUrl = parentUrl + removed;

          if (!layer.path) {
            layer.path = '/';
          }
          if (layerError) {
            layer.handle_error(layerError, req, res, next)
          } else {
            layer.handle_requrest(req, res, next)
          }
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
    let setPath = false;
    if (typeof path === 'function') {
      fn = path;
      path = '/';
      setPath = true;
    }

    const layer = new Layer(path, fn);
    layer.route = undefined;
    if (proto.isPrototypeOf(fn)) {
      layer.isRouter = true;
    }
    if (setPath) {
      layer.setPath = setPath
    }
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