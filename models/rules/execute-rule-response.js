"use strict";

module.exports = class ExecuteRuleResponse {
  constructor (ruleId, isRulePass, ruleScore) {
    this.RuleId = ruleId;
    this.IsRulePass = isRulePass;
    this.RuleScore = ruleScore;
  }
}
