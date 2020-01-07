class Layer {
  constructor(path, fn) {
    this.handle = fn;
    this.name = fn.name || '<anonymous>';
    this.path = path;
  }

  handle_requrest(req, res) {
    const fn = this.handle;
    if (fn) {
      fn(req, res);
    }
  }

  match(path) {
    if (path === this.path || path === '*') {
      return true;
    }
    return false;
  }
}

module.exports = Layer;