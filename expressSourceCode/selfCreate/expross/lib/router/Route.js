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
  dispatch(req, res) {
    const method = req.method.toLowerCase();
    for (let i = 0; i < this.stack.length; i++) {
      if (this.stack[i].method === method) {
        return this.stack[i].handle_requrest(req, res)
      }
    }
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