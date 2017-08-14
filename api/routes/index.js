"use strict";

const cors = require('cors');
const defaultRoutes = require('./default-routes');
const ruleSetRoutes = require('./rule-set-routes');

module.exports = function(app) {
  app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
  app.options('*', cors());
  defaultRoutes(app);
  ruleSetRoutes(app);

  app.use(function(req, res) {
    res.status(400).send({ url: req.originalUrl + ' not found'});
  })
}
