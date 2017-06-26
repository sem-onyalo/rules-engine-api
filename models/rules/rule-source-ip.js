"use strict";

const DsObject = require('../ds').DsObject;

module.exports = class RuleSourceIp extends DsObject {
  /**
   * Represents a rule executed on a source IP address.
   * @constructor
   * @param {integer} Id - The unique identifier of the item.
   * @param {integer} RuleId - The unique identifier of the rule item.
   * @param {array} CountryCodes - The collection of country codes associated to this rule.
   */
  constructor(id, ruleId, countryCodes) {
    super(id);
    this.RuleId = ruleId;
    this.CountryCodes = countryCodes;
  }
}
