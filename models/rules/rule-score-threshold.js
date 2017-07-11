"use strict";

const Rule = require('./rule');

module.exports = class RuleScoreThreshold extends Rule {
  constructor(id, type, score, threshold, childRules, emailOnFail, emailTo, emailSubject, emailBody) {
    super(id, score, type);
    this.Threshold = threshold;
    this.ChildRules = childRules;
    this.EmailOnFail = emailOnFail;
    this.EmailTo = emailTo;
    this.EmailSubject = emailSubject;
    this.EmailBody = emailBody;
  }
}
