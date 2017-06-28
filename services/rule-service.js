"use strict";

const Models = require('../models');

module.exports = class RuleService {
  /**
   * Represents rule operations.
   * @constructor
   * @param {Services.AccountService} accountService - The account service.
   * @param {Services.RestApi.GeolocationClient} geolocationClient - The geolocation rest client.
   * @param {Repositories.AccountRepository} accountRepository - The account repository.
   * @param {Repositories.BlockItemRepository} blockItemRepository - The block item repository.
   * @param {Repositories.ruleRepository} ruleRepository - The rule repository.
   */
  constructor(accountService, geolocationClient, accountRepository, blockItemRepository, ruleRepository) {
    this._accountService = accountService;
    this._geolocationClient = geolocationClient;
    this._accountRepository = accountRepository;
    this._blockItemRepository = blockItemRepository;
    this._ruleRepository = ruleRepository;
  }

  /**
   * Represents a request to execute a rule.
   * @name executeRule
   * @param {Models.Rules.ExecuteRuleRequest} executeRuleRequest - The rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeRule(executeRuleRequest) {
    if (executeRuleRequest instanceof Models.Rules.ExecuteSourceIpRuleRequest) {
      return this.executeSourceIpRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteEmailBlocklistRuleRequest) {
      return this.executeEmailBlocklistRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteAccountLockedRuleRequest) {
      return this.executeAccountLockedRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteDifferentEmailRuleRequest) {
      return this.executeDifferentEmailRule(executeRuleRequest);
    } else {
      throw 'Unsupported rule request type';
    }
  }

  /**
   * Represents a request to execute a source IP rule.
   * @name executeSourceIpRule
   * @param {Models.Rules.ExecuteSourceIpRuleRequest} executeRuleRequest - The source IP rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeSourceIpRule(executeRuleRequest) {
    let sourceIpRule = this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let ipLookupResponse = this._geolocationClient.ipLookup(executeRuleRequest.SourceIp);

    let isRulePass = false, ruleScore = sourceIpRule.Score;
    for (let i = 0; i < sourceIpRule.CountryCodes.length; i++) {
      if (ipLookupResponse.Country == sourceIpRule.CountryCodes[i]) {
        isRulePass = true;
        ruleScore = 0;
        break;
      }
    }

    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, isRulePass, ruleScore);
    return response;
  }

  /**
   * Represents a request to execute an email blocklist rule.
   * @name executeEmailBlocklistRule
   * @param {Models.Rules.ExecuteEmailBlocklistRuleRequest} executeRuleRequest - The email blocklist rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeEmailBlocklistRule(executeRuleRequest) {
    let blockItem = this._blockItemRepository.selectByTypeAndValue(Models.BlockItemType.Email, executeRuleRequest.Email);
    let isRulePass = blockItem == null;
    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, isRulePass);
    return response;
  }

  /**
   * Represents a request to execute an account locked rule.
   * @name executeAccountLockedRule
   * @param {Models.Rules.ExecuteAccountLockedRuleRequest} executeRuleRequest - The account locked rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeAccountLockedRule(executeRuleRequest) {
    let account = this._accountRepository.selectById(executeRuleRequest.AccountId);
    let isRulePass = account == null || (account != null && account.IsLocked == false);
    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, isRulePass);
    return response;
  }

  /**
   * Represents a request to execute a different email rule.
   * @name executeDifferentEmailRule
   * @param {Models.Rules.ExecuteDifferentEmailRuleRequest} executeRuleRequest - The different email rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
   executeDifferentEmailRule(executeRuleRequest) {
     let rule = this._ruleRepository.selectById(executeRuleRequest.RuleId);
     let isRulePass = executeRuleRequest.ExpectedEmail == executeRuleRequest.ActualEmail;
     let ruleScore = !isRulePass ? rule.Score : 0;
     let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, isRulePass, ruleScore);
     return response;
   }
};
