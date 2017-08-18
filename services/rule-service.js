"use strict";

const Models = require('../models');
const RuleType = Models.Rules.RuleType;

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
   * Represents a request to get a collection of rule sets.
   * @name getRuleSets
   * @returns {Array} An array of {Models.Rules.RuleSet} objects.
   */
  async getRuleSets() {
    return await this._ruleSetRepository.selectAll();
  }

  /**
   * Represents a request to create a rule set.
   * @name createRuleSet
   * @param {Models.Rules.CreateRuleSetRequest} createRuleSetRequest - The rule set creation object.
   * @returns {Models.Rules.RuleSet} The created rule set.
   */
  async createRuleSet(createRuleSetRequest) {
    if ([undefined, null, ''].indexOf(createRuleSetRequest.Name) >= 0 || (createRuleSetRequest.Name && createRuleSetRequest.Name.trim() === '')) {
      throw 'The rule set name cannot be empty';
    }

    let ruleSet = new Models.Rules.RuleSet(0, createRuleSetRequest.Name, undefined, createRuleSetRequest.StopProcessingOnFail);
    return await this._ruleSetRepository.insert(ruleSet);
  }

  /**
   * Represents a request to create a rule.
   * @name createRule
   * @param {Models.Rules.CreateRuleRequest} createRuleRequest - The rule request creation object.
   * @returns {Models.Rules.Rule} The created rule.
   */
  async createRule(createRuleRequest) {
    this.validateCreateRuleRequest(createRuleRequest);
    let rule = new Models.Rules.Rule(0, createRuleRequest.RuleScore, createRuleRequest.RuleType, createRuleRequest.EmailOnFail);
    rule.ParentId = createRuleRequest.ParentRuleId;
    return await this._ruleRepository.insert(createRuleRequest.RuleSetId, rule);
  }

  /**
   * Validates a request to create a rule.
   * @name validateCreateRuleRequest
   * @param {Models.Rules.CreateRuleRequest} createRuleRequest - The rule request creation object.
   * @throws An exception if validation fails.
   */
  validateCreateRuleRequest(createRuleRequest) {
    if (!Number.isInteger(createRuleRequest.RuleSetId)) {
      throw 'The rule set id is not a valid integer';
    }

    if (!Number.isInteger(createRuleRequest.ParentRuleId)) {
      throw 'The parent rule id is not a valid integer';
    }

    if (!Number.isInteger(createRuleRequest.RuleType)
      || (Number.isInteger(createRuleRequest.RuleType) && (createRuleRequest.RuleType <= RuleType.NONE || createRuleRequest.RuleType > RuleType.REQUESTS_FROM_IP))) {
      throw 'The rule type is not a valid integer or is not a valid type';
    }

    if (Number.isNaN(parseFloat(createRuleRequest.RuleScore)) || !Number.isFinite(createRuleRequest.RuleScore)) {
      throw 'The rule score is not a valid number';
    }

    if (typeof createRuleRequest.EmailOnFail !== 'boolean') {
      throw 'The email on fail value is not a valid boolean';
    }
  }

  /**
   * Represents a request to execute a rule set.
   * @name executeRuleSet
   * @param {Models.Rules.ExecuteRuleSetRequest} executeRuleSetRequest - The rule set execution object.
   * @returns {Models.Rules.ExecuteRuleSetResponse}
   */
  async executeRuleSet(executeRuleSetRequest) {
    let rulePassed = true;
    let executeRuleSetMessage = '';
    let ruleSet = await this._ruleSetRepository.selectById(executeRuleSetRequest.RuleSetId);
    for (let i = 0; i < ruleSet.Rules.length; i++) {
      let ruleResponse;
      if (ruleSet.Rules[i].Type == Models.Rules.RuleType.ACCOUNT_LOCKED) {
        let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleSet.Rules[i].Id, executeRuleSetRequest.AccountId);
        ruleResponse = await this.executeAccountLockedRule(ruleRequest);
      } else if (ruleSet.Rules[i].Type == Models.Rules.RuleType.EMAIL_BLOCKLIST) {
        let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleSet.Rules[i].Id, executeRuleSetRequest.ActualEmail);
        ruleResponse = await this.executeEmailBlocklistRule(ruleRequest);
      } else if (ruleSet.Rules[i].Type == Models.Rules.RuleType.SCORE_THRESHOLD) {
        let ruleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(ruleSet.Rules[i].Id, executeRuleSetRequest.OrderId, executeRuleSetRequest.AccountId, executeRuleSetRequest.ExpectedEmail, executeRuleSetRequest.ActualEmail, executeRuleSetRequest.SourceIp);
        ruleResponse = await this.executeScoreThresholdRule(ruleRequest);
      } else {
        throw 'Unsupported rule type in rule set';
      }

      rulePassed = rulePassed && ruleResponse.IsRulePass;
      if (!rulePassed && ruleSet.StopProcessingOnFail) break;
    }

    return new Models.Rules.ExecuteRuleSetResponse(rulePassed);
  }

  /**
   * Represents a request to execute a rule.
   * @name executeRule
   * @param {Models.Rules.ExecuteRuleRequest} executeRuleRequest - The rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  async executeRule(executeRuleRequest) {
    if (executeRuleRequest instanceof Models.Rules.ExecuteAccountLockedRuleRequest) {
      return await this.executeAccountLockedRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteEmailBlocklistRuleRequest) {
      return await this.executeEmailBlocklistRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteScoreThresholdRuleRequest) {
      return await this.executeScoreThresholdRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteDifferentEmailRuleRequest) {
      return await this.executeDifferentEmailRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteSourceIpRuleRequest) {
      return await this.executeSourceIpRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest) {
      return await this.executeOrdersCreatedInTimespanRule(executeRuleRequest);
    } else if (executeRuleRequest instanceof Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest) {
      return await this.executeRequestsFromIpInTimespanRule(executeRuleRequest);
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
  async executeSourceIpRule(executeRuleRequest) {
    let sourceIpRule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let ipLookupResponse = await this._geolocationClient.ipLookup(executeRuleRequest.SourceIp);

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
  async executeEmailBlocklistRule(executeRuleRequest) {
    let rule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let blockItem = await this._blockItemRepository.selectByTypeAndValue(Models.BlockItemType.Email, executeRuleRequest.Email);
    let rulePassed = blockItem == null;

    let response = this.handleRuleResult(rule, rulePassed, 0);
    return response;
  }

  /**
   * Represents a request to execute an account locked rule.
   * @name executeAccountLockedRule
   * @param {Models.Rules.ExecuteAccountLockedRuleRequest} executeRuleRequest - The account locked rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  async executeAccountLockedRule(executeRuleRequest) {
    let rule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);
    let account = await this._accountRepository.selectById(executeRuleRequest.AccountId);
    let rulePassed = account == null || (account != null && account.IsLocked == false);

    let response = this.handleRuleResult(rule, rulePassed, 0);
    return response;
  }

  /**
   * Represents a request to execute a different email rule.
   * @name executeDifferentEmailRule
   * @param {Models.Rules.ExecuteDifferentEmailRuleRequest} executeRuleRequest - The different email rule execution request object.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  async executeDifferentEmailRule(executeRuleRequest) {
     let rule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);
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
  async executeOrdersCreatedInTimespanRule(executeRuleRequest) {
     let rule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);
     let splunkSearchParams = [executeRuleRequest.OrderId, 'now()', (rule.ThresholdMinutes * -1).toString() + 'm'];
     let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(
       Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN,
       splunkSearchParams,
       'json'
     );

     let splunkSearchResponse = await this._splunkClient.search(splunkSearchRequest);

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
  async executeRequestsFromIpInTimespanRule(executeRuleRequest) {
    let rule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);
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

    let splunkSearchResponse = await this._splunkClient.search(splunkSearchRequest);

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
  async executeScoreThresholdRule(executeRuleRequest) {
    let rule = await this._ruleRepository.selectById(executeRuleRequest.RuleId);

    let ruleScore = 0;
    for(let i = 0; i < rule.ChildRules.length; i++) {
      if (rule.ChildRules[i].Type == Models.Rules.RuleType.DIFFERENT_EMAIL) {
        let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.ExpectedEmail, executeRuleRequest.ActualEmail);
        let ruleResponse = await this.executeDifferentEmailRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else if (rule.ChildRules[i].Type == Models.Rules.RuleType.SOURCE_IP) {
        let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.SourceIp);
        let ruleResponse = await this.executeSourceIpRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else if (rule.ChildRules[i].Type == Models.Rules.RuleType.ORDERS_CREATED) {
        let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.AccountId, executeRuleRequest.OrderId);
        let ruleResponse = await this.executeOrdersCreatedInTimespanRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else if (rule.ChildRules[i].Type == Models.Rules.RuleType.REQUESTS_FROM_IP) {
        let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(rule.ChildRules[i].Id, executeRuleRequest.SourceIp, executeRuleRequest.AccountId);
        let ruleResponse = await this.executeRequestsFromIpInTimespanRule(ruleRequest);
        ruleScore += ruleResponse.RuleScore;
      } else {
        throw 'Unsupported rule type';
      }
    }

    let rulePassed = rule.Threshold >= ruleScore;
    let response = this.handleRuleResult(rule, rulePassed, ruleScore);
    return response;
  }

  /**
   * Performs the necessary actions based on the results of a rule.
   * @name handleRuleResult
   * @param {Models.Rules.Rule} rule - The rule object.
   * @param {bool} rulePassed - Whether or not the rule passed.
   * @param {float} ruleScore - The rule score.
   * @returns {Models.Rules.ExecuteRuleResponse}
   */
  handleRuleResult(rule, rulePassed, ruleScore) {
    if(!rulePassed && rule.EmailOnFail) {
      this._emailService.sendEmail(rule.EmailBody, rule.EmailSubject, rule.EmailTo);
    }

    let response = new Models.Rules.ExecuteRuleResponse(rule.Id, rulePassed, ruleScore);
    return response;
  }
};
