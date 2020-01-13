const path = require('path');
const fs = require('fs');

function tryStat(path) {
  try {
    return fs.statSync(path);
  } catch (e) {
    return undefined;
  }
}

class View {
  constructor(name, options) {
    const opts = options || {};
    this.defaultEngine = opts.defaultEngine;
    this.root = opts.root;
    this.ext = path.extname(name);
    this.name = name;
    const fileName = name;
    if (!this.ext) {
      this.ext = this.defaultEngine[0] !== '.' ? '.' + this.defaultEngine : this.defaultEngine;
      fileName += this.ext;
    }

    if (!opts.engines[this.ext]) {
      const mod = this.ext.substr(1);
      opts.engines[this.ext] = require(mod).__express;
    }

    this.engine = opts.engines[this.ext];
    this.path = this.lookup(fileName)
  }

  resolve(dir, file) {
    const ext = this.ext;
    const p = path.join(dir, file);
    const stat = tryStat(p);
    if (stat && stat.isFile()) {
      return p;
    }

    p = path.join(dir, path.basename(file, ext), 'index' + ext);
    stat = tryStat(p);

    if (stat && stat.isFile()) {
      return p;
    }
  }

  lookup(name) {
    let p;
    const roots = [].concat(this.root);
    for (let i = 0; i < roots.length && !p; i++) {
      const root = roots[i];
      const loc = path.resolve(root, name);
      const dir = path.dirname(loc);
      const file = path.basename(loc);
      p = this.resolve(dir, file);
    }
    return p;
  }

  render(options, callback) {
    this.engine(this.path, options, callback);
  }
}

module.exports = View;