"use strict";

module.exports = class CreateRuleRequest {
  constructor(ruleSetId, parentRuleId, ruleType, ruleScore, emailOnFail) {
    this.RuleSetId = ruleSetId;
    this.ParentRuleId = parentRuleId;
    this.RuleType = ruleType;
    this.RuleScore = ruleScore;
    this.EmailOnFail = emailOnFail;
  }
}
