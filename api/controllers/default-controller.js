"use strict";

const version = require('../../package.json').version;

exports.default = function (req, res) {
  res.json('Fraud Service API v' + version);
}
