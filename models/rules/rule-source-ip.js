"use strict";

const DsObject = require('../ds').DsObject;

module.exports = class RuleSourceIp extends DsObject {
  constructor(id, ruleId, countryCodes) {
    super(id);
    this.RuleId = ruleId;
    this.CountryCodes = countryCodes;
  }
}
