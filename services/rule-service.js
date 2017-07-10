"use strict";

const Models = require('../models');

module.exports = class RuleService {
  /**
   * Represents rule operations.
   * @constructor
   * @param {Services.AccountService} accountService - The account service.
   * @param {Services.CrossCutters.EmailService} emailService - The email service.
   * @param {Services.RestApi.GeolocationClient} geolocationClient - The geolocation rest api client.
   * @param {Services.RestApi.SplunkClient} splunkClient - The splunk rest api client.
   * @param {Repositories.AccountRepository} accountRepository - The account repository.
   * @param {Repositories.BlockItemRepository} blockItemRepository - The block item repository.
   * @param {Repositories.RuleRepository} ruleRepository - The rule repository.
   * @param {Repositories.RuleSetRepository} ruleSetRepository - The rule set repository.
   */
  constructor(accountService, emailService, geolocationClient, splunkClient, accountRepository, blockItemRepository, ruleRepository, ruleSetRepository) {
    this._accountService = accountService;
    this._emailService = emailService;
    this._geolocationClient = geolocationClient;
    this._splunkClient = splunkClient;
    this._accountRepository = accountRepository;
    this._blockItemRepository = blockItemRepository;
    this._ruleRepository = ruleRepository;
    this._ruleSetRepository = ruleSetRepository;
  }

  /**
   * Represents a request to execute a rule set.
   * @name executeRuleSet
   * @param {Models.Rules.ExecuteRuleSetRequest} executeRuleSetRequest - The rule set execution object.
   * @returns {Models.Rules.ExecuteRuleSetResponse}
   */
  executeRuleSet(executeRuleSetRequest) {
    let ruleSet = this._ruleSetRepository.selectById(executeRuleSetRequest.RuleSetId);

    for (let i = 0; i < ruleSet.Rules.length; i++) {
      if (ruleSet.Rules[i].Type == Models.Rules.RuleType.ACCOUNT_LOCKED) {
        let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleSet.Rules[i].Id, executeRuleSetRequest.AccountId);
        let ruleResponse = this.executeAccountLockedRule(ruleRequest);
      } else if (ruleSet.Rules[i].Type == Models.Rules.RuleType.EMAIL_BLOCKLIST) {
        let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleSet.Rules[i].Id, executeRuleSetRequest.ActualEmail);
        let ruleResponse = this.executeEmailBlocklistRule(ruleRequest);
      } else if (ruleSet.Rules[i].Type == Models.Rules.RuleType.SCORE_THRESHOLD) {
        let ruleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(ruleSet.Rules[i].Id, executeRuleSetRequest.OrderId, executeRuleSetRequest.AccountId, executeRuleSetRequest.ExpectedEmail, executeRuleSetRequest.ActualEmail, executeRuleSetRequest.SourceIp);
        let ruleResponse = this.executeScoreThresholdRule(ruleRequest);
      }
    }
  }

  /**
   * Represents a request to execute a rule.
   * @name executeRule
   * @param {Models.Rules.ExecuteRuleRequest} executeRuleRequest - The rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeRule(executeRuleRequest) {
    if (executeRuleRequest instanceof Models.Rules.ExecuteAccountLockedRuleRequest) {
      return this.executeAccountLockedRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteEmailBlocklistRuleRequest) {
      return this.executeEmailBlocklistRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteScoreThresholdRuleRequest) {
      return this.executeScoreThresholdRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteDifferentEmailRuleRequest) {
      return this.executeDifferentEmailRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteSourceIpRuleRequest) {
      return this.executeSourceIpRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest) {
      return this.executeOrdersCreatedInTimespanRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest) {
      return this.executeRequestsFromIpInTimespanRule(executeRuleRequest);
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

    let rulePassed = false, ruleScore = sourceIpRule.Score;
    for (let i = 0; i < sourceIpRule.CountryCodes.length; i++) {
      if (ipLookupResponse.Country == sourceIpRule.CountryCodes[i]) {
        rulePassed = true;
        ruleScore = 0;
        break;
      }
    }

    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, rulePassed, ruleScore);
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
    let rulePassed = blockItem == null;
    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, rulePassed);
    return response;
  }

  /**
   * Represents a request to execute an account locked rule.
   * @name executeAccountLockedRule
   * @param {Models.Rules.ExecuteAccountLockedRuleRequest} executeRuleRequest - The account locked rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeAccountLockedRule(executeRuleRequest) {
    let rule = this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let account = this._accountRepository.selectById(executeRuleRequest.AccountId);
    let rulePassed = account == null || (account != null && account.IsLocked == false);

    let response = this.handleRuleResult(executeRuleRequest, rule, rulePassed, 0);
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
     let rulePassed = executeRuleRequest.ExpectedEmail == executeRuleRequest.ActualEmail;
     let ruleScore = !rulePassed ? rule.Score : 0;
     let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, rulePassed, ruleScore);
     return response;
  }

  /**
   * Represents a request to execute an orders created in timespan rule.
   * @name executeOrdersCreatedInTimespanRule
   * @param {Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest} executeRuleRequest - The orders created in a timespan rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeOrdersCreatedInTimespanRule(executeRuleRequest) {
     let rule = this._ruleRepository.selectById(executeRuleRequest.RuleId);
     let splunkSearchParams = [executeRuleRequest.OrderId, 'now()', (rule.ThresholdMinutes * -1).toString() + 'm'];
     let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(
       Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN,
       splunkSearchParams,
       'json'
     );

     let splunkSearchResponse = this._splunkClient.search(splunkSearchRequest);

     let rulePassed = splunkSearchResponse.Count <= rule.ThresholdCount;
     let ruleScore = !rulePassed ? rule.Score : 0;
     let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, rulePassed, ruleScore);
     return response;
  }

  /**
   * Represents a request to execute a requests from IP in timespan rule.
   * @name executeRequestsFromIpInTimespanRule
   * @param {Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest} executeRuleRequest - The requests from an IP address in a timespan execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeRequestsFromIpInTimespanRule(executeRuleRequest) {
    let rule = this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let splunkSearchParams = [
      executeRuleRequest.IpAddress,
      'now()',
      (rule.ThresholdMinutes * -1).toString() + 'm',
      executeRuleRequest.AccountId
    ];
    let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(
      Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP,
      splunkSearchParams,
      'json'
    );

    let splunkSearchResponse = this._splunkClient.search(splunkSearchRequest);

    let rulePassed = splunkSearchResponse.Count <= rule.ThresholdCount;
    let ruleScore = !rulePassed ? rule.Score : 0;
    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, rulePassed, ruleScore);
    return response;
  }

  /**
   * Represents a request to execute a score threshold rule.
   * @name executeScoreThresholdRule
   * @param {Models.Rules.ExecuteScoreThresholdRuleRequest} executeRuleRequest - The score threshold execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  executeScoreThresholdRule(executeRuleRequest) {
    let rule = this._ruleRepository.selectById(executeRuleRequest.RuleId);

    let ruleScore = 0;
    for(let i = 0; i < rule.ChildRules.length; i++) {
      if (rule.ChildRules[i].Type == Models.Rules.RuleType.DIFFERENT_EMAIL) {
        let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.ExpectedEmail, executeRuleRequest.ActualEmail);
        let ruleResponse = this.executeDifferentEmailRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else if (rule.ChildRules[i].Type == Models.Rules.RuleType.SOURCE_IP) {
        let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.SourceIp);
        let ruleResponse = this.executeSourceIpRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else if (rule.ChildRules[i].Type == Models.Rules.RuleType.ORDERS_CREATED) {
        let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.AccountId, executeRuleRequest.OrderId);
        let ruleResponse = this.executeOrdersCreatedInTimespanRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else if (rule.ChildRules[i].Type == Models.Rules.RuleType.REQUESTS_FROM_IP) {
        let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.SourceIp, executeRuleRequest.AccountId);
        let ruleResponse = this.executeRequestsFromIpInTimespanRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else {
        throw 'Unsupported rule type';
      }
    }

    let rulePassed = rule.Threshold >= ruleScore;
    let response = new Models.Rules.ExecuteRuleResponse(executeRuleRequest.RuleId, rulePassed, ruleScore);
    return response;
  }

  /**
   * Performs the necessary actions based on the results of a rule.
   * @name handleRuleResult
   * @param {Models.Rules.ExecuteRuleRequest} executeRuleRequest - The rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  handleRuleResult(request, rule, rulePassed, ruleScore) {
    if(!rulePassed && rule.EmailOnFail) {
      // this._emailService.sendEmail(rule.EmailBody, rule.EmailSubject, rule.EmailTo);
    }

    let response = new Models.Rules.ExecuteRuleResponse(request.RuleId, rulePassed, ruleScore);
    return response;
  }
};
