var PENDING = 'PENDING';
var RESOLVED = 'RESOLVED';
var REJECTED = 'REJECTED';


function MyPromise(fn) {
  this.value = undefined;
  this.status = PENDING;
  this.resolveQueue = [];
  this.rejectQueue = [];
  if (typeof fn !== 'function') {
    throw new Error('not function');
  }
  fn(resolve.bind(this), reject.bind(this));
}

var resolve = function (value) {
  if (this.status !== PENDING) {
    return;
  }
  this.value = value;
  this.status = RESOLVED;
  var that = this;
  var cb;
  if (value instanceof MyPromise) {
    value.then(function (value) {
      while (cb = that.resolveQueue.shift()) {
        cb(value);
      }
    }, function (value) {
      while (cb = that.rejectQueue.shift()) {
        cb(value);
      }
    })
  } else {
    while (cb = this.resolveQueue.shift()) {
      cb(value);
    }
  }
}

var reject = function (value) {
  if (this.status !== PENDING) {
    return;
  }
  this.value = value;
  this.status = REJECTED;
  var cb;
  while (cb = this.rejectQueue.shift()) {
    cb(value);
  }
}


MyPromise.prototype.then = function (handleResolve, handleReject) {
  var that = this;

  return new MyPromise(function (nextResolve, nextReject) {

    var toNextResolve = function (value) {
      if (typeof nextResolve !== 'function') {
        throw new Error('not function');
      }
      var result = handleResolve(value);
      if (result instanceof MyPromise) {
        result.then(nextResolve, nextReject);
      } else {
        nextResolve(result);
      }
    }

    var toNextReject = function (value) {
      if (typeof nextReject !== 'function') {
        throw new Error('not function');
      }
      var result = handleReject(value);
      if (result instanceof MyPromise) {
        result.then(nextResolve, nextReject);
      } else {
        nextReject(result);
      }
    }

    switch (that.status) {
      case PENDING:
        that.resolveQueue.push(toNextResolve);
        that.rejectQueue.push(toNextReject);
        break;
      case RESOLVED:
        toNextResolve(that.value);
        break;
      case REJECTED:
        toNextReject(that.value);
        break;
    }
  })
}

var a = new MyPromise(function (re, rj) {
  setTimeout(function () {
    re(1);
  }, 1000)
})

a.then(function () {
  return new MyPromise(function (re) {
    re(new MyPromise(function (re, rj) {
      rj(123);
    }))
  })
}).then(function () {
  console.log('resolve');
}, function () {
  console.log('reject');
})