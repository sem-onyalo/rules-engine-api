"use strict";

const DsObject = require('../ds').DsObject;

module.exports = class Rule extends DsObject {
  /**
   * Represents a rule executed on a source IP address.
   * @constructor
   * @param {integer} id - The unique identifier of this rule.
   * @param {float} score - The score associated to this rule.
   */
  constructor(id, score) {
    super(id);
    this.Score = score;
  }
}
