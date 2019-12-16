var EventEmitter = require('events');
var util = require('util');

var MyPromise = function () {
  EventEmitter.call(this);
}

util.inherits(MyPromise, EventEmitter);

MyPromise.prototype.then = function (fulfilledHandler, errorHandler, progessHandler) {
  if (typeof fulfilledHandler === 'function') {
    this.once('success', fulfilledHandler);
  }
  if (typeof errorHandler === 'function') {
    this.once('error', errorHandler);
  }
  if (typeof progessHandler === 'function') {
    this.on('progress', progessHandler);
  }
  return this;
}

var Deferred = function () {
  this.state = 'pedding';
  this.promise = new MyPromise();
}

Deferred.prototype.resolve = function (obj) {
  this.state = 'fulfilled';
  this.promise.emit('success', obj);
}

Deferred.prototype.reject = function (err) {
  this.state = 'failed';
  this.promise.emit('error', err);
}

Deferred.prototype.progress = function (data) {
  this.promise.emit('progress', data);
}

var promisify = function (res) {
  var deferred = new Deferred();
  var result = '';
  res.on('data', function (chunk) {
    result += chunk;
    deferred.progress(chunk);
  })

  res.on('error', function (error) {
    deferred.reject(error);
  })

  res.on('end', function () {
    deferred.resolve(result);
  })
  return deferred.promise;
}

Deferred.all = function (promises) {
  var times = 0;
  var result = [];
  var deferred = new Deferred();
  deferred.promise.on('end', function () {
    deferred.resolve(result);
  })

  promises.forEach(function (item, i) {
    item.then(function (data) {
      times++;
      result[i] = data;
      if (times >= promises.length) {
        deferred.promise.emit('end');
      }
    }, function (err) {
      // TODO error
    })
  });

  return deferred.promise;
}
