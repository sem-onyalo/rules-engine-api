"use strict";

const defaultRoutes = require('./default-routes');
const ruleSetRoutes = require('./rule-set-routes');

module.exports = function(app) {
  defaultRoutes(app);
  ruleSetRoutes(app);

  app.use(function(req, res) {
    res.status(400).send({ url: req.originalUrl + ' not found'});
  })
}
