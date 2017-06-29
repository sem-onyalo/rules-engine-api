"use strict";

const Rule = require('./rule');

module.exports = class RuleFrequency extends Rule {
  constructor(id, score, thresholdCount, thresholdMinutes) {
    super(id, score);
    this.ThresholdCount = thresholdCount;
    this.ThresholdMinutes = thresholdMinutes;
  }
}
