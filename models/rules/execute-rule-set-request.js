"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteRuleSetRequest {
  constructor(ruleSetId, orderId, accountId, expectedEmail, actualEmail, sourceIp) {
    this.RuleSetId = ruleSetId;
    this.OrderId = orderId;
    this.AccountId = accountId;
    this.ExpectedEmail = expectedEmail;
    this.ActualEmail = actualEmail;
    this.SourceIp = sourceIp;
  }
}
