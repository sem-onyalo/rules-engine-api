"use strict";

const Models = require('../models');

module.exports = class RuleService {
  /**
   * Represents rule operations.
   * @constructor
   * @param {Services.AccountService} accountService - The account service.
   */
  constructor(accountService, geolocationClient, ruleRepository) {
    this._accountService = accountService;
    this._geolocationClient = geolocationClient;
    this._ruleRepository = ruleRepository;
  }

  /**
   * Represents a request to execute a rule.
   * @name executeRule
   * @param {Models.Rules.ExecuteRuleRequest} executeRuleRequest - The execute rule request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeRule(executeRuleRequest) {
    let sourceIpRule = this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let ipLookupResponse = this._geolocationClient.ipLookup(executeRuleRequest.SourceIp);
    
    let isRulePass = false;
    for (let i = 0; i < sourceIpRule.CountryCodes.length; i++) {
      if (ipLookupResponse.Country == sourceIpRule.CountryCodes[i]) {
        isRulePass = true;
        break;
      }
    }

    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, isRulePass);
    return response;
  }
};
