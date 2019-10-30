const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';

function MyPromise(fn) {
  if (typeof fn !== 'function') {
    console.log('not function');
  }
  this.value = undefined;
  this.status = PENDING;
  this.resolvedQueue = [];
  this.rejectedQueue = [];
  fn(resolve.bind(this), reject.bind(this));
}

MyPromise.prototype.then = function (handleResolve, handleReject) {
  var that = this
  // console.log(this.value, 111);
  // console.log(this.status, 222);

  return new MyPromise(function (nextResolve, nextReject) {
    switch (that.status) {
      case PENDING:
        this.resolvedQueue.push(handleResolve);
        this.rejectedQueue.push(handleReject);
        break;
      case RESOLVED:
        var result = handleResolve(that.value);
        nextResolve(result);
        break;
      case REJECTED:
        nextReject(handleReject(that.value))
        break;
    }
  })
}

var resolve = function (data) {
  if (this.status !== PENDING) {
    return;
  }
  this.status = RESOLVED;
  this.value = data;
  var cb;
  while (cb = this.resolvedQueue.shift()) {
    cb(data);
  }
}
var reject = function (err) {
  if (this.status !== PENDING) {
    return;
  }
  this.status = REJECTED;
  this.value = err;
  var cb;
  while (cb = this.rejectedQueue.shift()) {
    cb(err)
  }
}


var a = new MyPromise(function (re) {
  re(1)
});

setTimeout(function () {
  a.then(function (data) {
    data += 1;
    console.log(data);
    return data;
  }).then(function (data) {
    data += 1;
    console.log(data);
    return data;
  }).then(function (data) {
    data += 1;
    console.log(data);
    return data;
  }).then(function (data) {
    data += 1;
    console.log(data);
    return data;
  })
}, 1000)
