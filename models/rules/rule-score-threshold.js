"use strict";

const Rule = require('./rule');

module.exports = class RuleScoreThreshold extends Rule {
  constructor(id, threshold, childRules) {
    super(id);
    this.Threshold = threshold;
    this.ChildRules = childRules;
  }
}
