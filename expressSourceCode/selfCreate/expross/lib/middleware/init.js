const request = require('../request');
const response = require('../response');

exports.init = function expressInit(req, res, next) {
  req.res = res;
  res.req = req;
  Object.setPrototypeOf(req, request);
  Object.setPrototypeOf(res, response);
  next();
}