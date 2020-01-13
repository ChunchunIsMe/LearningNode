class Layer {
  constructor(path, fn) {
    this.handle = fn;
    this.name = fn.name || '<anonymous>';
    this.path = undefined;
    this.fast_star = (path === '*' ? true : false);
    if (!this.fast_star) {
      this.path = path;
    }
  }

  handle_requrest(req, res, next) {
    const fn = this.handle;
    try {
      fn(req, res, next);
    } catch (err) {
      next(err)
    }
  }

  match(path) {
    if (this.fast_star) {
      this.path = '';
      return true;
    }

    if (this.route && this.path === path) {
      return true;
    }

    if (!this.route) {
      if (this.setPath && this.path === '/') {
        this.path = '';
        return true;
      }
      if (this.isRouter && this.path === path.slice(0, this.path.length)) {
        return true;
      }
      if (this.path === path) {
        return true;
      }
    }
    return false;
  }

  handle_error(error, req, res, next) {
    const fn = this.handle;
    if (fn.length !== 4) {
      return next(error);
    }
    try {
      fn(error, req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = Layer;