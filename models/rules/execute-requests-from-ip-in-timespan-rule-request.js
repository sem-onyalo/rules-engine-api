"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteRequestsFromIpInTimespanRuleRequest extends ExecuteRuleRequest {
  /**
   * Represents a request to execute a rule relating to requests from an IP address in a timespan.
   * @constructor
   * @param {integer} ruleId - The unique identifier of the rule.
   * @param {string} ipAddress - The source IP address of the requests.
   * @param {string} accountId - The unique identifier of the account.
   */
  constructor(ruleId, ipAddress, accountId) {
    super(ruleId);
    this.IpAddress = ipAddress;
    this.AccountId = accountId;
  }
}
