"use strict";

const Config = require('../../config');

module.exports = class ConfigService {
  constructor() { }

  getSetting(type, key) {
    return Config[type][key];
  }
}
