"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteEmailBlocklistRuleRequest extends ExecuteRuleRequest {
  constructor(ruleId, email) {
    super(ruleId);
    this.Email = email;
  }
}
