"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteDifferentEmailRuleRequest extends ExecuteRuleRequest {
  constructor(ruleId, expectedEmail, actualEmail) {
    super(ruleId);
    this.ExpectedEmail = expectedEmail;
    this.ActualEmail = actualEmail;
  }
}
