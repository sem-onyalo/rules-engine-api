"use strict";

module.exports = function(app) {
  let controller = require('../controllers/rule-controller');

  app.route('/rules')
    .post(controller.createRule);
}
