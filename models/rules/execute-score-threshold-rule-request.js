"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteScoreThresholdRuleRequest extends ExecuteRuleRequest {
  constructor(ruleId, orderId, accountId, expectedEmail, actualEmail, sourceIp) {
    super(ruleId);
    this.OrderId = orderId;
    this.AccountId = accountId;
    this.ExpectedEmail = expectedEmail;
    this.ActualEmail = actualEmail;
    this.SourceIp = sourceIp;
  }
}
