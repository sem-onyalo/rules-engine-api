"use strict";

module.exports = function(app) {
  let controller = require('../controllers/rule-set-controller');

  app.route('/rulesets/:ruleSetId/execute')
    .get(controller.executeRuleSet);

  app.route('/rulesets/:ruleSetId/ping')
    .get(controller.pingRuleSet);
}