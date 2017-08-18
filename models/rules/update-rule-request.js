"use strict";

module.exports = class UpdateRuleRequest {
  constructor(ruleId, parentRuleId, ruleType, ruleScore, emailOnFail) {
    this.RuleId = ruleId;
    this.ParentRuleId = parentRuleId;
    this.RuleType = ruleType;
    this.RuleScore = ruleScore;
    this.EmailOnFail = emailOnFail;
  }
}
