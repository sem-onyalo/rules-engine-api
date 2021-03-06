"use strict";

module.exports = function(app) {
  let controller = require('../controllers/default-controller');

  app.route('/').get(controller.default);
  app.route('/ping').get(controller.ping);
}
