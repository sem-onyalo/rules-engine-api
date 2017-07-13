"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const AccountService = require('./account-service');
const EmailService = require('./cross-cutters/email-service');
const Models = require('../models');
const Repositories = require('../repositories');
const RestApi = require('./rest-api');
const RuleService = require('./rule-service');

describe('RuleService', () => {
  let accountService;
  let emailService;
  let geolocationClient;
  let splunkClient;
  let accountRepository;
  let blockItemRepository;
  let ruleRepository;
  let ruleSetRepository;
  let ruleService;

  let accountServiceStub;
  let emailServiceStub;
  let geolocationClientStub;
  let splunkClientStub;
  let accountRepositoryStub;
  let blockItemRepositoryStub;
  let ruleRepositoryStub;
  let ruleSetRepositoryStub;

  beforeEach(function () {
    accountService = new AccountService();
    emailService = new EmailService();
    geolocationClient = new RestApi.GeolocationClient();
    splunkClient = new RestApi.SplunkClient();
    accountRepository = new Repositories.AccountRepository();
    blockItemRepository = new Repositories.BlockItemRepository();
    ruleRepository = new Repositories.Rules.RuleRepository();
    ruleSetRepository = new Repositories.Rules.RuleSetRepository();

    emailServiceStub = sinon
      .stub(emailService, 'sendEmail');

    ruleService = new RuleService(accountService, emailService, geolocationClient, splunkClient, accountRepository, blockItemRepository, ruleRepository, ruleSetRepository);
  });

  afterEach(function () {
    emailServiceStub.restore();
  })

  describe('executeRule(executeRuleRequest)', () => {
    it('should export function', () => {
      expect(ruleService.executeRule).to.be.a('function');
    });

    it('should throw an expection if the rule request is an unsupported type', () => {
      let ruleRequest = function UnsupportedRuleRequest() {
        this.RuleId = 123;
      };

      let executeRuleFn = function () { ruleService.executeRule(ruleRequest) };

      expect(executeRuleFn).to.throw('Unsupported rule request type');
    });

    it('should run the source IP rule and return rule passed if countries from rule in repository and ip lookup match', () => {
      let ruleId = 123, ruleScore = 0, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country.Code]));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(new Models.RestApi.GeolocationIpLookupResponse(country.Code));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the source IP rule and return rule not passed if countries from rule in repository and ip lookup match', () => {
      let ruleId = 123, ruleScore = 0, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country.Code]));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(new Models.RestApi.GeolocationIpLookupResponse('US'));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the source IP rule and return the rule score if the rule failed', () => {
      let ruleId = 123, ruleScore = 2.5, sourceIp = '127.0.0.1';
      let country1 = new Models.Country(1, 'CA'), country2 = new Models.Country(1, 'US');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country1.Code, country2.Code]));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(new Models.RestApi.GeolocationIpLookupResponse('TH'));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to expected value');
    });

    it('should run the source IP rule and return rule score 0 if the rule passed', () => {
      let ruleId = 123, ruleScore = 2.5, sourceIp = '127.0.0.1';
      let country1 = new Models.Country(1, 'CA'), country2 = new Models.Country(1, 'US');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country1.Code, country2.Code]));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(new Models.RestApi.GeolocationIpLookupResponse('US'));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the email blocklist rule and return rule passed if email is not on blocklist', () => {
      let ruleId = 123, ruleScore = 2.5, email = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleId, email);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST, false));

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(null);

      let ruleResponse = ruleService.executeRule(ruleRequest);

      blockItemRepositoryStub.restore();

      sinon.assert.calledOnce(blockItemRepositoryStub);
      sinon.assert.calledWith(blockItemRepositoryStub, Models.BlockItemType.Email, email);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the email blocklist rule and return rule failed if email is on blocklist', () => {
      let ruleId = 123, ruleScore = 2.5, email = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleId, email);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST, false));

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(new Models.BlockItem(1, Models.BlockItemType.Email, 'jdoe@nomail.com'));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      blockItemRepositoryStub.restore();

      sinon.assert.calledOnce(blockItemRepositoryStub);
      sinon.assert.calledWith(blockItemRepositoryStub, Models.BlockItemType.Email, email);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the email blocklist rule and send an email if the rule fails and the EmailOnFail flag is set', () => {
      let emailTo = 'fraudteam@nomail.com', emailSubject = 'Rule Failure', emailBody = 'A rule failed';

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST, true, emailTo, emailSubject, emailBody));

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(new Models.BlockItem(1, Models.BlockItemType.Email, 'jdoe@nomail.com'));

      ruleService.executeRule(new Models.Rules.ExecuteEmailBlocklistRuleRequest(1, 'jdoe@nomail.com'));

      ruleRepositoryStub.restore();
      sinon.assert.calledWith(emailServiceStub, emailBody, emailSubject, emailTo);
    });

    it('should run the account locked rule and return rule failed if account is locked', () => {
      let ruleId = 123, ruleScore = 0, accountId = 456, isAccountLocked = true;
      let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleId, accountId);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(ruleId, ruleScore, false));

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(new Models.Account(accountId, isAccountLocked));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      accountRepositoryStub.restore();

      sinon.assert.calledOnce(accountRepositoryStub);
      sinon.assert.calledWith(accountRepositoryStub, accountId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the account locked rule and return rule passed if account is not locked', () => {
      let ruleId = 123, ruleScore = 0, accountId = 456, isAccountLocked = false;
      let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleId, accountId);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(ruleId, ruleScore, false));

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(new Models.Account(accountId, isAccountLocked));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      accountRepositoryStub.restore();

      sinon.assert.calledOnce(accountRepositoryStub);
      sinon.assert.calledWith(accountRepositoryStub, accountId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the account locked rule and send an email if the rule fails and the EmailOnFail flag is set', () => {
      let emailTo = 'fraudteam@nomail.com', emailSubject = 'Rule Failure', emailBody = 'A rule failed';

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.ACCOUNT_LOCKED, true, emailTo, emailSubject, emailBody));

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(new Models.Account(987, true));

      ruleService.executeRule(new Models.Rules.ExecuteAccountLockedRuleRequest(1, 987));

      ruleRepositoryStub.restore();
      sinon.assert.calledWith(emailServiceStub, emailBody, emailSubject, emailTo);
    });

    it('should run the different email rule and return rule failed if emails are different', () => {
      let ruleId = 123, ruleScore = 0, expectedEmail = 'jdoe@nomail.com', actualEmail = 'john.doe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(ruleId, ruleScore));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the different email rule and return rule passed if email are the same', () => {
      let ruleId = 123, ruleScore = 0, expectedEmail = 'jdoe@nomail.com', actualEmail = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(ruleId, ruleScore));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the different email rule and return the rule score if the rule failed', () => {
      let ruleId = 123, ruleScore = 2.5, expectedEmail = 'jdoe@nomail.com', actualEmail = 'john.doe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(ruleId, ruleScore));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to the expected value');
    });

    it('should run the different email rule and return a rule score 0 if the rule passed', () => {
      let ruleId = 123, ruleScore = 2.5, expectedEmail = 'jdoe@nomail.com', actualEmail = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.Rule(ruleId, ruleScore));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the orders created in timespan rule and return rule failed if search count > rule threshold count', () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 0, ruleThresholdCount = 0, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the orders created in timespan rule and return rule passed if search count == rule threshould count', () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 0, ruleThresholdCount = 1, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the orders created in timespan rule and return rule passed if search count < rule threshould count', () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 0, ruleThresholdCount = 2, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the orders created in timespan rule and return rule score if rule failed', () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 2.5, ruleThresholdCount = 0, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to the expected value');
    });

    it('should run the orders created in timespan rule and return rule score 0 if rule passed', () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 2.5, ruleThresholdCount = 2, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the requests from ip in timespan rule and return rule failed if search count > rule threshold', () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 0, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the requests from ip in timespan rule and return rule passed if search count == rule threshold', () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 1, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the requests from ip in timespan rule and return rule passed if search count < rule threshold', () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 2, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the requests from ip in timespan rule and return rule score if the rule failed', () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 0, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to expected value');
    });

    it('should run the requests from ip in timespan rule and return rule score 0 if the rule passed', () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 1, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the score threshold rule and return a combined rule score and rule failed if combined rule score > threshold', () => {
      let ruleId = 1, scoreThreshold = 9, accountId = 456, orderId = 789;
      let differentEmailRuleId = 2, sourceIpRuleId = 3, ordersCreatedRuleId = 4, requestsFromIpRuleId = 5;
      let differentEmailRuleScore = 1, sourceIpRuleScore = 2, ordersCreatedRuleScore = 3, requestsFromIpRuleScore = 4;
      let childRules = [
        new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore, Models.Rules.RuleType.DIFFERENT_EMAIL),
        new Models.Rules.Rule(sourceIpRuleId, sourceIpRuleScore, Models.Rules.RuleType.SOURCE_IP),
        new Models.Rules.Rule(ordersCreatedRuleId, ordersCreatedRuleScore, Models.Rules.RuleType.ORDERS_CREATED),
        new Models.Rules.Rule(requestsFromIpRuleId, requestsFromIpRuleScore, Models.Rules.RuleType.REQUESTS_FROM_IP)
      ];
      let sourceIp = '127.0.0.1', email = 'jdoe@nomail.com', expectedEmail = 'john.doe@nomail.com';
      let splunkSearchCount = 1;
      let ordersCreatedRuleThresholdCount = 0, ordersCreatedRuleThresholdMin = 180;
      let requestsFromIpRuleThresholdCount = 0, requestsFromIpRuleThresholdMin = 180, accountCountThreshold = 2;
      let ruleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(ruleId, orderId, accountId, expectedEmail, email, sourceIp);

      ruleRepositoryStub = sinon.stub(ruleRepository, 'selectById');

      ruleRepositoryStub
        .withArgs(ruleId)
        .returns(new Models.Rules.RuleScoreThreshold(ruleId, Models.Rules.RuleType.SCORE_THRESHOLD, 0, scoreThreshold, childRules));

      ruleRepositoryStub
        .withArgs(differentEmailRuleId)
        .returns(new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore));

      ruleRepositoryStub
        .withArgs(sourceIpRuleId)
        .returns(new Models.Rules.RuleSourceIp(sourceIpRuleId, sourceIpRuleScore, ['CA','US']));

      ruleRepositoryStub
        .withArgs(ordersCreatedRuleId)
        .returns(new Models.Rules.RuleFrequency(ordersCreatedRuleId, ordersCreatedRuleScore, ordersCreatedRuleThresholdCount, ordersCreatedRuleThresholdMin));

      ruleRepositoryStub
        .withArgs(requestsFromIpRuleId)
        .returns(new Models.Rules.RuleAccountFrequency(requestsFromIpRuleId, requestsFromIpRuleScore, requestsFromIpRuleThresholdCount, requestsFromIpRuleThresholdMin, accountCountThreshold));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup');

      geolocationClientStub
        .withArgs(sourceIp)
        .returns(new Models.RestApi.GeolocationIpLookupResponse('TH'));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();
      splunkClientStub.restore();

      sinon.assert.callCount(ruleRepositoryStub, 5);
      sinon.assert.calledOnce(geolocationClientStub);
      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
      assert.strictEqual(ruleResponse.RuleScore, 10, 'Rule score was not expected value');
    });

    it('should run the score threshold rule and return a combined rule score and rule passed if combined rule score == threshold', () => {
      let ruleId = 1, scoreThreshold = 9, accountId = 456, orderId = 789;
      let differentEmailRuleId = 2, sourceIpRuleId = 3, ordersCreatedRuleId = 4, requestsFromIpRuleId = 5;
      let differentEmailRuleScore = 1, sourceIpRuleScore = 1, ordersCreatedRuleScore = 3, requestsFromIpRuleScore = 4;
      let childRules = [
        new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore, Models.Rules.RuleType.DIFFERENT_EMAIL),
        new Models.Rules.Rule(sourceIpRuleId, sourceIpRuleScore, Models.Rules.RuleType.SOURCE_IP),
        new Models.Rules.Rule(ordersCreatedRuleId, ordersCreatedRuleScore, Models.Rules.RuleType.ORDERS_CREATED),
        new Models.Rules.Rule(requestsFromIpRuleId, requestsFromIpRuleScore, Models.Rules.RuleType.REQUESTS_FROM_IP)
      ];
      let sourceIp = '127.0.0.1', email = 'jdoe@nomail.com', expectedEmail = 'john.doe@nomail.com';
      let splunkSearchCount = 1;
      let ordersCreatedRuleThresholdCount = 0, ordersCreatedRuleThresholdMin = 180;
      let requestsFromIpRuleThresholdCount = 0, requestsFromIpRuleThresholdMin = 180, accountCountThreshold = 2;
      let ruleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(ruleId, orderId, accountId, expectedEmail, email, sourceIp);

      ruleRepositoryStub = sinon.stub(ruleRepository, 'selectById');

      ruleRepositoryStub
        .withArgs(ruleId)
        .returns(new Models.Rules.RuleScoreThreshold(ruleId, Models.Rules.RuleType.SCORE_THRESHOLD, 0, scoreThreshold, childRules));

      ruleRepositoryStub
        .withArgs(differentEmailRuleId)
        .returns(new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore));

      ruleRepositoryStub
        .withArgs(sourceIpRuleId)
        .returns(new Models.Rules.RuleSourceIp(sourceIpRuleId, sourceIpRuleScore, ['CA','US']));

      ruleRepositoryStub
        .withArgs(ordersCreatedRuleId)
        .returns(new Models.Rules.RuleFrequency(ordersCreatedRuleId, ordersCreatedRuleScore, ordersCreatedRuleThresholdCount, ordersCreatedRuleThresholdMin));

      ruleRepositoryStub
        .withArgs(requestsFromIpRuleId)
        .returns(new Models.Rules.RuleAccountFrequency(requestsFromIpRuleId, requestsFromIpRuleScore, requestsFromIpRuleThresholdCount, requestsFromIpRuleThresholdMin, accountCountThreshold));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup');

      geolocationClientStub
        .withArgs(sourceIp)
        .returns(new Models.RestApi.GeolocationIpLookupResponse('TH'));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();
      splunkClientStub.restore();

      sinon.assert.callCount(ruleRepositoryStub, 5);
      sinon.assert.calledOnce(geolocationClientStub);
      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
      assert.strictEqual(ruleResponse.RuleScore, 9, 'Rule score was not expected value');
    });

    it('should run the score threshold rule and return a combined rule score and rule passed if combined rule score < threshold', () => {
      let ruleId = 1, scoreThreshold = 9, accountId = 456, orderId = 789;
      let differentEmailRuleId = 2, sourceIpRuleId = 3, ordersCreatedRuleId = 4, requestsFromIpRuleId = 5;
      let differentEmailRuleScore = 1, sourceIpRuleScore = 1, ordersCreatedRuleScore = 2, requestsFromIpRuleScore = 4;
      let childRules = [
        new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore, Models.Rules.RuleType.DIFFERENT_EMAIL),
        new Models.Rules.Rule(sourceIpRuleId, sourceIpRuleScore, Models.Rules.RuleType.SOURCE_IP),
        new Models.Rules.Rule(ordersCreatedRuleId, ordersCreatedRuleScore, Models.Rules.RuleType.ORDERS_CREATED),
        new Models.Rules.Rule(requestsFromIpRuleId, requestsFromIpRuleScore, Models.Rules.RuleType.REQUESTS_FROM_IP)
      ];
      let sourceIp = '127.0.0.1', email = 'jdoe@nomail.com', expectedEmail = 'john.doe@nomail.com';
      let splunkSearchCount = 1;
      let ordersCreatedRuleThresholdCount = 0, ordersCreatedRuleThresholdMin = 180;
      let requestsFromIpRuleThresholdCount = 0, requestsFromIpRuleThresholdMin = 180, accountCountThreshold = 2;
      let ruleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(ruleId, orderId, accountId, expectedEmail, email, sourceIp);

      ruleRepositoryStub = sinon.stub(ruleRepository, 'selectById');

      ruleRepositoryStub
        .withArgs(ruleId)
        .returns(new Models.Rules.RuleScoreThreshold(ruleId, Models.Rules.RuleType.SCORE_THRESHOLD, 0, scoreThreshold, childRules));

      ruleRepositoryStub
        .withArgs(differentEmailRuleId)
        .returns(new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore));

      ruleRepositoryStub
        .withArgs(sourceIpRuleId)
        .returns(new Models.Rules.RuleSourceIp(sourceIpRuleId, sourceIpRuleScore, ['CA','US']));

      ruleRepositoryStub
        .withArgs(ordersCreatedRuleId)
        .returns(new Models.Rules.RuleFrequency(ordersCreatedRuleId, ordersCreatedRuleScore, ordersCreatedRuleThresholdCount, ordersCreatedRuleThresholdMin));

      ruleRepositoryStub
        .withArgs(requestsFromIpRuleId)
        .returns(new Models.Rules.RuleAccountFrequency(requestsFromIpRuleId, requestsFromIpRuleScore, requestsFromIpRuleThresholdCount, requestsFromIpRuleThresholdMin, accountCountThreshold));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup');

      geolocationClientStub
        .withArgs(sourceIp)
        .returns(new Models.RestApi.GeolocationIpLookupResponse('TH'));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(new Models.RestApi.SplunkSearchResponse(splunkSearchCount));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();
      splunkClientStub.restore();

      sinon.assert.callCount(ruleRepositoryStub, 5);
      sinon.assert.calledOnce(geolocationClientStub);
      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
      assert.strictEqual(ruleResponse.RuleScore, 8, 'Rule score was not expected value');
    });

    it('should run the score threshold rule and send an email if the rule fails and the EmailOnFail flag is set', () => {
      let emailTo = 'fraudteam@nomail.com', emailSubject = 'Rule Failure', emailBody = 'A rule failed';

      ruleRepositoryStub = sinon.stub(ruleRepository, 'selectById');

      ruleRepositoryStub
        .withArgs(1)
        .returns(new Models.Rules.RuleScoreThreshold(1, Models.Rules.RuleType.SCORE_THRESHOLD, 0, 5, [
          new Models.Rules.Rule(2, 10, Models.Rules.RuleType.DIFFERENT_EMAIL)
        ], true, emailTo, emailSubject, emailBody));

      ruleRepositoryStub
        .withArgs(2)
        .returns(new Models.Rules.Rule(2, 10));

      ruleService.executeRule(new Models.Rules.ExecuteScoreThresholdRuleRequest(1, null, null, 'john.doe@nomail.com', 'jdoe@nomail.com', null));

      ruleRepositoryStub.restore();
      sinon.assert.calledWith(emailServiceStub, emailBody, emailSubject, emailTo);
    });
  });

  describe('executeRuleSet(executeRuleSetRequest)', () => {
    let ruleSetId = 1, orderId = 2, accountId = 3, sourceIp = '127.0.0.1';
    let expectedEmail = 'jdoe@nomail.com', actualEmail = 'jdoe@nomail.com';
    let accountLockedRuleId = 1, emailBlocklistRuleId = 2, scoreThresholdRuleId = 3;
    let ruleSetRequest = new Models.Rules.ExecuteRuleSetRequest(ruleSetId, orderId, accountId, expectedEmail, actualEmail, sourceIp);

    it('should export function', () => {
      expect(ruleService.executeRuleSet).to.be.a('function');
    });

    it('should run all rules in a rule set', () => {
      let accountLockedRuleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(accountLockedRuleId, accountId);
      let emailBlocklistRuleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(emailBlocklistRuleId, actualEmail);
      let scoreThresholdRuleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(scoreThresholdRuleId, orderId, accountId, expectedEmail, actualEmail, sourceIp);

      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], false));

        let executeAccountLockedRuleStub = sinon
          .stub(ruleService, 'executeAccountLockedRule')
          .returns(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5));

        let executeEmailBlocklistRuleStub = sinon
          .stub(ruleService, 'executeEmailBlocklistRule')
          .returns(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, true, 4.5));

        let executeScoreThresholdRuleStub = sinon
          .stub(ruleService, 'executeScoreThresholdRule')
          .returns(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5));

      ruleService.executeRuleSet(ruleSetRequest);

      getRuleSetStub.restore();
      executeAccountLockedRuleStub.restore();
      executeEmailBlocklistRuleStub.restore();
      executeScoreThresholdRuleStub.restore();
      sinon.assert.calledWith(getRuleSetStub, ruleSetId);
      sinon.assert.calledWith(executeAccountLockedRuleStub, accountLockedRuleRequest);
      sinon.assert.calledWith(executeEmailBlocklistRuleStub, emailBlocklistRuleRequest);
      sinon.assert.calledWith(executeScoreThresholdRuleStub, scoreThresholdRuleRequest);
    });

    it('should return rule set passed if all rules passed', () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], false));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5));

      let executeEmailBlocklistRuleStub = sinon
        .stub(ruleService, 'executeEmailBlocklistRule')
        .returns(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, true, 4.5));

      let executeScoreThresholdRuleStub = sinon
        .stub(ruleService, 'executeScoreThresholdRule')
        .returns(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5));

      let response = ruleService.executeRuleSet(ruleSetRequest);

      assert.isDefined(response, 'Execute rule set should return a response');
      assert.strictEqual(response.RulePassed, true, 'Rule set should pass');
    });

    it('should return rule set failed if one out of x rules fails', () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], false));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5));

      let executeEmailBlocklistRuleStub = sinon
        .stub(ruleService, 'executeEmailBlocklistRule')
        .returns(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, false, 4.5));

      let executeScoreThresholdRuleStub = sinon
        .stub(ruleService, 'executeScoreThresholdRule')
        .returns(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5));

      let response = ruleService.executeRuleSet(ruleSetRequest);

      assert.isDefined(response, 'Execute rule set should return a response');
      assert.strictEqual(response.RulePassed, false, 'Rule set should not pass');
    });

    it('should stop processing rules if rule fails and flag is set', () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], true));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5));

      let executeEmailBlocklistRuleStub = sinon
        .stub(ruleService, 'executeEmailBlocklistRule')
        .returns(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, false, 4.5));

      let executeScoreThresholdRuleStub = sinon
        .stub(ruleService, 'executeScoreThresholdRule')
        .returns(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5));

      let response = ruleService.executeRuleSet(ruleSetRequest);

      assert.isDefined(response, 'Execute rule set should return a response');
      assert.strictEqual(response.RulePassed, false, 'Rule set should not pass');
      sinon.assert.notCalled(executeScoreThresholdRuleStub);
    });

    it('should throw an exception if there is an unsupported rule in the rule set', () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, 9999)
        ], true));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5));

      let executeRuleSetFn = function () { ruleService.executeRuleSet(ruleSetRequest); };

      expect(executeRuleSetFn).to.throw('Unsupported rule type in rule set');
    });
  });
});
