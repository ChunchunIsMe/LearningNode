const http = require('http');
const Layer = require('./Layer');
const Route = require('./Route');
class Router {
  constructor() {
    this.stack = [new Layer('*', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('404');
    })]
  }

  route(path) {
    const route = new Route(path);
    const layer = new Layer(path, (req, res) => {
      route.dispatch(req, res);
    })
    layer.route = route;
    this.stack.push(layer);
    return route;
  }

  handle(req, res) {
    // console.log(JSON.stringify(this.stack));
    debugger;
    for (let i = 1; i < this.stack.length; i++) {
      debugger;
      if (this.stack[i].match(req.url) &&
        this.stack[i].route &&
        this.stack[i].route._handles_method(req.method)) {
        return this.stack[i].handle_requrest(req, res);
      }
    }
    return this.stack[0].handle_requrest(req, res);
  }
}

http.METHODS.forEach(method => {
  method = method.toLowerCase();
  Router.prototype[method] = function (path,fn) {
    const route = this.route(path);
    route[method](fn);
    return this;
  }
})
module.exports = Router;