"use strict";

const DbContext = require('../../repositories/db-context');
const version = require('../../package.json').version;

exports.default = (req, res) => {
  res.json('Fraud Service API v' + version);
}

exports.ping = async (req, res) => {
  let dbContext = new DbContext();
  let result = await dbContext.ping();
  res.json(result.toString());
}
