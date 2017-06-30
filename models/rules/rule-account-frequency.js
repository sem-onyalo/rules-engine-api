"use strict";

const Rule = require('./rule');

module.exports = class RuleAccountFrequency extends Rule {
  constructor(id, score, thresholdCount, thresholdMinutes, accountCountThreshold) {
    super(id, score);
    this.ThresholdCount = thresholdCount;
    this.ThresholdMinutes = thresholdMinutes;
    this.AccountCountThreshold = accountCountThreshold;
  }
}
