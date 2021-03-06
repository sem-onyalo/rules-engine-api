"use strict";

const DsObject = require('../ds').DsObject;
const Rule = require('./rule');

module.exports = class RuleSourceIp extends Rule {
  /**
   * Represents a rule executed on a source IP address.
   * @constructor
   * @param {integer} id - The unique identifier of this rule.
   * @param {float} score - The score associated to this rule.
   * @param {array} countryCodes - The collection of country codes associated to this rule.
   */
  constructor(id, score, countryCodes) {
    super(id, score);
    this.CountryCodes = countryCodes;
  }
}
