const request = require('../request');
const response = require('../response');

exports.init = function (app) {
  return function expressInit(req, res, next) {
    req.res = res;
    res.req = req;
    req.app = app;
    Object.setPrototypeOf(req, request);
    Object.setPrototypeOf(res, response);
    next();
  }
}

