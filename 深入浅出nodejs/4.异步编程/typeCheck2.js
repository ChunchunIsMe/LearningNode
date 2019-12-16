var toString = Object.prototype.toString;

var isType = function (type) {
  return function (obj) {
    return toString.call === '[object ' + type + ']';
  }
}

var isString = isType('String');
var isFunction = isFunction('Function');