"use strict";

const Rule = require('./rule');

module.exports = class RuleFrequency extends Rule {
  constructor(id, score, thresholdMinutes) {
    super(id, score);
    this.ThresholdMinutes = thresholdMinutes;
  }
}
