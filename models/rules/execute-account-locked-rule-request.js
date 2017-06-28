"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteAccountLockedRuleRequest extends ExecuteRuleRequest {
  constructor(ruleId, accountId) {
    super(ruleId);
    this.AccountId = accountId;
  }
}
