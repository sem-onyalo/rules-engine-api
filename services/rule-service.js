"use strict";

module.exports = class RuleService {
  /**
   * Represents rule operations.
   * @constructor
   * @param {Services.AccountService} accountService - The account service.
   */
  constructor(accountService) {
    this._accountService = accountService;
  }

  /**
   * Represents a request to execute a rule.
   * @name executeRule
   * @param {Models.Rules.ExecuteRuleRequest} executeRuleRequest - The execute rule request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeRule(executeRuleRequest) {

  }
};
