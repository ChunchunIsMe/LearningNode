const http = require('http');
const Layer = require('./Layer');
const Route = require('./Route');
class Router {
  constructor() {
    this.stack = []
  }

  route(path) {
    const route = new Route(path);
    const layer = new Layer(path, route.dispatch.bind(route))
    layer.route = route;
    this.stack.push(layer);
    return route;
  }

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

      if (layer.match(req.url) && layer.route && layer.route._handles_method(method)) {
        return layer.handle_requrest(req, res, next);
      } else {
        next(layerError);
      }
    }
    next();
  }
}

http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Router.prototype[method] = function (path, fn) {
    const route = this.route(path);
    route[method](fn);
    return this;
  }
})
module.exports = Router;