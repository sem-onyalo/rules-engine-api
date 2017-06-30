"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteOrdersCreatedInTimespanRuleRequest extends ExecuteRuleRequest {
  /**
   * Represents a request to execute a rule relating to the time since an order was created.
   * @constructor
   * @param {integer} ruleId - The unique identifier of the rule.
   * @param {string} accountId - The unique identifier of the account.
   * @param {string} orderId - The unique identifier of the rule.
   */
  constructor(ruleId, accountId, orderId) {
    super(ruleId);
    this.AccountId = accountId;
    this.OrderId = orderId;
  }
}
