"use strict";

const version = require('../../package.json').version;

exports.default = function (req, res) {
  res.json('Fraud Service API v' + version);
}

exports.ping = function (req, res) {
  let DbContext = require('../../repositories/db-context');
  DbContext.ping(function(result) {
    res.json(result);
  });
}
