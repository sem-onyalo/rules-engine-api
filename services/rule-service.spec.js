"use strict";

const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
chai.use(require('chai-as-promised'));

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
  });

  describe('getRuleSets()', () => {
    let ruleSets = [
      new Models.Rules.RuleSet(1, 'Rule Set 1'),
      new Models.Rules.RuleSet(2, 'Rule Set 2'),
      new Models.Rules.RuleSet(3, 'Rule Set 3')
    ];

    it('should export function', () => {
      expect(ruleService.getRuleSets).to.be.a('function');
    });

    it('should call the rule repository to get a collections of rule set objects', async () => {
      let getRuleSetsStub = sinon
        .stub(ruleSetRepository, 'selectAll')
        .returns(Promise.resolve(ruleSets));

      let actual = await ruleService.getRuleSets();

      sinon.assert.calledOnce(getRuleSetsStub);
      assert.deepStrictEqual(actual, ruleSets, 'Returned rule sets was not the expected value');
    });
  });

  describe('createRuleSet(createRuleSetRequest)', () => {
    it('should export function', () => {
      expect(ruleService.createRuleSet).to.be.a('function');
    });

    it('should throw an exception if the name is empty', async () => {
      let promises = [];
      let data = [undefined, null, '', '  '];
      let request = new Models.Rules.CreateRuleSetRequest();

      for (let i = 0; i < data.length; i++) {
        request.Name = data[i];

        promises.push(
          assert.isRejected(ruleService.createRuleSet(request), 'The rule set name cannot be empty')
        );
      }

      return Promise.all(promises);
    });

    it('should call the rule repository to create a new rule set', async () => {
      let expected = new Models.Rules.RuleSet(4, 'Rule Set 4', undefined, true);
      let expectedNew = new Models.Rules.RuleSet(0, 'Rule Set 4', undefined, true);
      let insertRuleSetStub = sinon
        .stub(ruleSetRepository, 'insert')
        .returns(Promise.resolve(expected));

      let request = new Models.Rules.CreateRuleSetRequest('Rule Set 4', true);

      let actual = await ruleService.createRuleSet(request);
      sinon.assert.calledWith(insertRuleSetStub, expectedNew);
      assert.deepStrictEqual(actual, expected, 'The returned rule set was not the expected value');
    });
  });

  describe('createRule(createRuleRequest)', () => {
    it('should export function', () => {
      expect(ruleService.createRule).to.be.a('function');
    });

    it('should throw an exception if the rule set id is not an integer', () => {
      let promises = [];
      let data = [undefined, null, '', '  ', 'R'];
      let request = new Models.Rules.CreateRuleRequest();

      for (let i = 0; i < data.length; i++) {
        request.RuleSetId = data[i];

        promises.push(
          assert.isRejected(ruleService.createRule(request), 'The rule set id is not a valid integer')
        );
      }

      return Promise.all(promises);
    });

    it('should throw an excpetion if the parent rule id is not an integer', () => {
      let promises = [];
      let data = [undefined, null, '', '  ', 'R'];
      let request = new Models.Rules.CreateRuleRequest(9);

      for (let i = 0; i < data.length; i++) {
        request.ParentRuleId = data[i];

        promises.push(
          assert.isRejected(ruleService.createRule(request), 'The parent rule id is not a valid integer')
        );
      }

      return Promise.all(promises);
    });

    it('should throw an exception if the rule type is not an integer or is not a valid type', () => {
      let promises = [];
      let data = [undefined, null, '', '  ', 'R', 0, 8];
      let request = new Models.Rules.CreateRuleRequest(9, 1);

      for (let i = 0; i < data.length; i++) {
        request.RuleType = data[i];

        promises.push(
          assert.isRejected(ruleService.createRule(request), 'The rule type is not a valid integer or is not a valid type')
        );
      }

      return Promise.all(promises);
    });

    it('should throw an exception if the rule score is not a number', () => {
      let promises = [];
      let data = [undefined, null, '', '  ', 'R'];
      let request = new Models.Rules.CreateRuleRequest(9, 1, 2);

      for (let i = 0; i < data.length; i++) {
        request.RuleScore = data[i];

        promises.push(
          assert.isRejected(ruleService.createRule(request), 'The rule score is not a valid number')
        );
      }

      return Promise.all(promises);
    });

    it('should throw an exception if email on fail is not a boolean', () => {
      let promises = [];
      let data = [undefined, null, '', '  ', 'R', 0, 2.5];
      let request = new Models.Rules.CreateRuleRequest(9, 1, 2, 5.5);

      for (let i = 0; i < data.length; i++) {
        request.EmailOnFail = data[i];

        promises.push(
          assert.isRejected(ruleService.createRule(request), 'The email on fail value is not a valid boolean')
        );
      }

      return Promise.all(promises);
    });

    it('should call the rule repository to create a new rule', async () => {
      let expectedRuleSetId = 9;
      let expectedRuleArg = new Models.Rules.Rule(0, 5.5, Models.Rules.RuleType.ACCOUNT_LOCKED, false);
      expectedRuleArg.ParentId = 1;
      let insertRuleStub = sinon.stub(ruleRepository, 'insert');

      let request = new Models.Rules.CreateRuleRequest(expectedRuleSetId, 1, Models.Rules.RuleType.ACCOUNT_LOCKED, 5.5, false);
      await ruleService.createRule(request);
      sinon.assert.calledOnce(insertRuleStub);
      sinon.assert.calledWith(insertRuleStub, expectedRuleSetId, expectedRuleArg);
    });
  });

  describe('executeRule(executeRuleRequest)', () => {
    it('should export function', () => {
      expect(ruleService.executeRule).to.be.a('function');
    });

    it('should throw an expection if the rule request is an unsupported type', () => {
      let ruleRequest = function UnsupportedRuleRequest() {
        this.RuleId = 123;
      };

      return assert.isRejected(ruleService.executeRule(ruleRequest), 'Unsupported rule request type');
    });

    it('should run the source IP rule and return rule passed if countries from rule in repository and ip lookup match', async () => {
      let ruleId = 123, ruleScore = 0, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country.Code])));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse(country.Code)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the source IP rule and return rule not passed if countries from rule in repository and ip lookup do not match', async () => {
      let ruleId = 123, ruleScore = 0, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country.Code])));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse('US')));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the source IP rule and return the rule score if the rule failed', async () => {
      let ruleId = 123, ruleScore = 2.5, sourceIp = '127.0.0.1';
      let country1 = new Models.Country(1, 'CA'), country2 = new Models.Country(1, 'US');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country1.Code, country2.Code])));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse('TH')));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to expected value');
    });

    it('should run the source IP rule and return rule score 0 if the rule passed', async () => {
      let ruleId = 123, ruleScore = 2.5, sourceIp = '127.0.0.1';
      let country1 = new Models.Country(1, 'CA'), country2 = new Models.Country(1, 'US');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(ruleId, ruleScore, [country1.Code, country2.Code])));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup')
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse('US')));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(geolocationClientStub);
      sinon.assert.calledWith(geolocationClientStub, sourceIp);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the email blocklist rule and return rule passed if email is not on blocklist', async () => {
      let ruleId = 123, ruleScore = 2.5, email = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleId, email);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST, false)));

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(Promise.resolve(null));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      blockItemRepositoryStub.restore();

      sinon.assert.calledOnce(blockItemRepositoryStub);
      sinon.assert.calledWith(blockItemRepositoryStub, Models.BlockItemType.Email, email);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the email blocklist rule and return rule failed if email is on blocklist', async () => {
      let ruleId = 123, ruleScore = 2.5, email = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleId, email);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST, false)));

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(Promise.resolve(new Models.BlockItem(1, Models.BlockItemType.Email, 'jdoe@nomail.com')));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      blockItemRepositoryStub.restore();

      sinon.assert.calledOnce(blockItemRepositoryStub);
      sinon.assert.calledWith(blockItemRepositoryStub, Models.BlockItemType.Email, email);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the email blocklist rule and send an email if the rule fails and the EmailOnFail flag is set', async () => {
      let emailTo = 'fraudteam@nomail.com', emailSubject = 'Rule Failure', emailBody = 'A rule failed';

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST, true, emailTo, emailSubject, emailBody)));

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(Promise.resolve(new Models.BlockItem(1, Models.BlockItemType.Email, 'jdoe@nomail.com')));

      await ruleService.executeRule(new Models.Rules.ExecuteEmailBlocklistRuleRequest(1, 'jdoe@nomail.com'));

      ruleRepositoryStub.restore();
      sinon.assert.calledWith(emailServiceStub, emailBody, emailSubject, emailTo);
    });

    it('should run the account locked rule and return rule failed if account is locked', async () => {
      let ruleId = 123, ruleScore = 0, accountId = 456, isAccountLocked = true;
      let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleId, accountId);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(ruleId, ruleScore, false)));

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(Promise.resolve(new Models.Account(accountId, isAccountLocked)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      accountRepositoryStub.restore();

      sinon.assert.calledOnce(accountRepositoryStub);
      sinon.assert.calledWith(accountRepositoryStub, accountId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the account locked rule and return rule passed if account is not locked', async () => {
      let ruleId = 123, ruleScore = 0, accountId = 456, isAccountLocked = false;
      let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleId, accountId);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(ruleId, ruleScore, false)));

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(Promise.resolve(new Models.Account(accountId, isAccountLocked)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      accountRepositoryStub.restore();

      sinon.assert.calledOnce(accountRepositoryStub);
      sinon.assert.calledWith(accountRepositoryStub, accountId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the account locked rule and send an email if the rule fails and the EmailOnFail flag is set', async () => {
      let emailTo = 'fraudteam@nomail.com', emailSubject = 'Rule Failure', emailBody = 'A rule failed';

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(1, 0, Models.Rules.RuleType.ACCOUNT_LOCKED, true, emailTo, emailSubject, emailBody)));

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(Promise.resolve(new Models.Account(987, true)));

      await ruleService.executeRule(new Models.Rules.ExecuteAccountLockedRuleRequest(1, 987));

      ruleRepositoryStub.restore();
      sinon.assert.calledWith(emailServiceStub, emailBody, emailSubject, emailTo);
    });

    it('should run the different email rule and return rule failed if emails are different', async () => {
      let ruleId = 123, ruleScore = 0, expectedEmail = 'jdoe@nomail.com', actualEmail = 'john.doe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(ruleId, ruleScore)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the different email rule and return rule passed if email are the same', async () => {
      let ruleId = 123, ruleScore = 0, expectedEmail = 'jdoe@nomail.com', actualEmail = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(ruleId, ruleScore)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the different email rule and return the rule score if the rule failed', async () => {
      let ruleId = 123, ruleScore = 2.5, expectedEmail = 'jdoe@nomail.com', actualEmail = 'john.doe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(ruleId, ruleScore)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to the expected value');
    });

    it('should run the different email rule and return a rule score 0 if the rule passed', async () => {
      let ruleId = 123, ruleScore = 2.5, expectedEmail = 'jdoe@nomail.com', actualEmail = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteDifferentEmailRuleRequest(ruleId, expectedEmail, actualEmail);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.Rule(ruleId, ruleScore)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the orders created in timespan rule and return rule failed if search count > rule threshold count', async () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 0, ruleThresholdCount = 0, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the orders created in timespan rule and return rule passed if search count == rule threshould count', async () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 0, ruleThresholdCount = 1, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the orders created in timespan rule and return rule passed if search count < rule threshould count', async () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 0, ruleThresholdCount = 2, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the orders created in timespan rule and return rule score if rule failed', async () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 2.5, ruleThresholdCount = 0, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to the expected value');
    });

    it('should run the orders created in timespan rule and return rule score 0 if rule passed', async () => {
      let ruleId = 123, accountId = '456', orderId = 'a1b2c3';
      let ruleScore = 2.5, ruleThresholdCount = 2, ruleThresholdMin = 180;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.ORDERS_CREATED_IN_TIMESPAN;
      let splunkSearchParams = ['a1b2c3', 'now()', '-180m'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteOrdersCreatedInTimespanRuleRequest(ruleId, accountId, orderId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the requests from ip in timespan rule and return rule failed if search count > rule threshold', async () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 0, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the requests from ip in timespan rule and return rule passed if search count == rule threshold', async () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 1, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the requests from ip in timespan rule and return rule passed if search count < rule threshold', async () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 2, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the requests from ip in timespan rule and return rule score if the rule failed', async () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 0, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 2.5, 'Rule score was not set to expected value');
    });

    it('should run the requests from ip in timespan rule and return rule score 0 if the rule passed', async () => {
      let ipAddress = '127.0.0.1', accountId = '456';
      let ruleId = 123, ruleScore = 2.5, ruleThresholdCount = 1, ruleThresholdMin = 180, accountCountThreshold = 2;
      let splunkSearchCount = 1;
      let splunkSearchQuery = Models.RestApi.SplunkSearchQueries.REQUESTS_FROM_IP;
      let splunkSearchParams = ['127.0.0.1', 'now()', '-180m', '456'], splunkSearchOutput = 'json';
      let ruleRequest = new Models.Rules.ExecuteRequestsFromIpInTimespanRuleRequest(ruleId, ipAddress, accountId);
      let splunkSearchRequest = new Models.RestApi.SplunkSearchRequest(splunkSearchQuery, splunkSearchParams, splunkSearchOutput);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(ruleId, ruleScore, ruleThresholdCount, ruleThresholdMin, accountCountThreshold)));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      splunkClientStub.restore();

      sinon.assert.calledOnce(ruleRepositoryStub);
      sinon.assert.calledWith(ruleRepositoryStub, ruleId);

      sinon.assert.calledOnce(splunkClientStub);
      sinon.assert.calledWith(splunkClientStub, splunkSearchRequest);

      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score should be zero if rule passed');
    });

    it('should run the score threshold rule and return a combined rule score and rule failed if combined rule score > threshold', async () => {
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
        .returns(Promise.resolve(new Models.Rules.RuleScoreThreshold(ruleId, Models.Rules.RuleType.SCORE_THRESHOLD, 0, scoreThreshold, childRules)));

      ruleRepositoryStub
        .withArgs(differentEmailRuleId)
        .returns(Promise.resolve(new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore)));

      ruleRepositoryStub
        .withArgs(sourceIpRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(sourceIpRuleId, sourceIpRuleScore, ['CA','US'])));

      ruleRepositoryStub
        .withArgs(ordersCreatedRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ordersCreatedRuleId, ordersCreatedRuleScore, ordersCreatedRuleThresholdCount, ordersCreatedRuleThresholdMin)));

      ruleRepositoryStub
        .withArgs(requestsFromIpRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(requestsFromIpRuleId, requestsFromIpRuleScore, requestsFromIpRuleThresholdCount, requestsFromIpRuleThresholdMin, accountCountThreshold)));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup');

      geolocationClientStub
        .withArgs(sourceIp)
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse('TH')));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();
      splunkClientStub.restore();

      sinon.assert.callCount(ruleRepositoryStub, 5);
      sinon.assert.calledOnce(geolocationClientStub);
      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
      assert.strictEqual(ruleResponse.RuleScore, 10, 'Rule score was not expected value');
    });

    it('should run the score threshold rule and return a combined rule score and rule passed if combined rule score == threshold', async () => {
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
        .returns(Promise.resolve(new Models.Rules.RuleScoreThreshold(ruleId, Models.Rules.RuleType.SCORE_THRESHOLD, 0, scoreThreshold, childRules)));

      ruleRepositoryStub
        .withArgs(differentEmailRuleId)
        .returns(Promise.resolve(new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore)));

      ruleRepositoryStub
        .withArgs(sourceIpRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(sourceIpRuleId, sourceIpRuleScore, ['CA','US'])));

      ruleRepositoryStub
        .withArgs(ordersCreatedRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ordersCreatedRuleId, ordersCreatedRuleScore, ordersCreatedRuleThresholdCount, ordersCreatedRuleThresholdMin)));

      ruleRepositoryStub
        .withArgs(requestsFromIpRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(requestsFromIpRuleId, requestsFromIpRuleScore, requestsFromIpRuleThresholdCount, requestsFromIpRuleThresholdMin, accountCountThreshold)));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup');

      geolocationClientStub
        .withArgs(sourceIp)
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse('TH')));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();
      splunkClientStub.restore();

      sinon.assert.callCount(ruleRepositoryStub, 5);
      sinon.assert.calledOnce(geolocationClientStub);
      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
      assert.strictEqual(ruleResponse.RuleScore, 9, 'Rule score was not expected value');
    });

    it('should run the score threshold rule and return a combined rule score and rule passed if combined rule score < threshold', async () => {
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
        .returns(Promise.resolve(new Models.Rules.RuleScoreThreshold(ruleId, Models.Rules.RuleType.SCORE_THRESHOLD, 0, scoreThreshold, childRules)));

      ruleRepositoryStub
        .withArgs(differentEmailRuleId)
        .returns(Promise.resolve(new Models.Rules.Rule(differentEmailRuleId, differentEmailRuleScore)));

      ruleRepositoryStub
        .withArgs(sourceIpRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleSourceIp(sourceIpRuleId, sourceIpRuleScore, ['CA','US'])));

      ruleRepositoryStub
        .withArgs(ordersCreatedRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleFrequency(ordersCreatedRuleId, ordersCreatedRuleScore, ordersCreatedRuleThresholdCount, ordersCreatedRuleThresholdMin)));

      ruleRepositoryStub
        .withArgs(requestsFromIpRuleId)
        .returns(Promise.resolve(new Models.Rules.RuleAccountFrequency(requestsFromIpRuleId, requestsFromIpRuleScore, requestsFromIpRuleThresholdCount, requestsFromIpRuleThresholdMin, accountCountThreshold)));

      geolocationClientStub = sinon
        .stub(geolocationClient, 'ipLookup');

      geolocationClientStub
        .withArgs(sourceIp)
        .returns(Promise.resolve(new Models.RestApi.GeolocationIpLookupResponse('TH')));

      splunkClientStub = sinon
        .stub(splunkClient, 'search')
        .returns(Promise.resolve(new Models.RestApi.SplunkSearchResponse(splunkSearchCount)));

      let ruleResponse = await ruleService.executeRule(ruleRequest);

      ruleRepositoryStub.restore();
      geolocationClientStub.restore();
      splunkClientStub.restore();

      sinon.assert.callCount(ruleRepositoryStub, 5);
      sinon.assert.calledOnce(geolocationClientStub);
      assert.isDefined(ruleResponse, 'function should return an ExecuteRuleResponse object');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
      assert.strictEqual(ruleResponse.RuleScore, 8, 'Rule score was not expected value');
    });

    it('should run the score threshold rule and send an email if the rule fails and the EmailOnFail flag is set', async () => {
      let emailTo = 'fraudteam@nomail.com', emailSubject = 'Rule Failure', emailBody = 'A rule failed';

      ruleRepositoryStub = sinon.stub(ruleRepository, 'selectById');

      ruleRepositoryStub
        .withArgs(1)
        .returns(Promise.resolve(new Models.Rules.RuleScoreThreshold(1, Models.Rules.RuleType.SCORE_THRESHOLD, 0, 5, [
          new Models.Rules.Rule(2, 10, Models.Rules.RuleType.DIFFERENT_EMAIL)
        ], true, emailTo, emailSubject, emailBody)));

      ruleRepositoryStub
        .withArgs(2)
        .returns(Promise.resolve(new Models.Rules.Rule(2, 10)));

      await ruleService.executeRule(new Models.Rules.ExecuteScoreThresholdRuleRequest(1, null, null, 'john.doe@nomail.com', 'jdoe@nomail.com', null));

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

    it('should run all rules in a rule set', async () => {
      let accountLockedRuleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(accountLockedRuleId, accountId);
      let emailBlocklistRuleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(emailBlocklistRuleId, actualEmail);
      let scoreThresholdRuleRequest = new Models.Rules.ExecuteScoreThresholdRuleRequest(scoreThresholdRuleId, orderId, accountId, expectedEmail, actualEmail, sourceIp);

      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], false)));

        let executeAccountLockedRuleStub = sinon
          .stub(ruleService, 'executeAccountLockedRule')
          .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5)));

        let executeEmailBlocklistRuleStub = sinon
          .stub(ruleService, 'executeEmailBlocklistRule')
          .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, true, 4.5)));

        let executeScoreThresholdRuleStub = sinon
          .stub(ruleService, 'executeScoreThresholdRule')
          .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5)));

      await ruleService.executeRuleSet(ruleSetRequest);

      getRuleSetStub.restore();
      executeAccountLockedRuleStub.restore();
      executeEmailBlocklistRuleStub.restore();
      executeScoreThresholdRuleStub.restore();
      sinon.assert.calledWith(getRuleSetStub, ruleSetId);
      sinon.assert.calledWith(executeAccountLockedRuleStub, accountLockedRuleRequest);
      sinon.assert.calledWith(executeEmailBlocklistRuleStub, emailBlocklistRuleRequest);
      sinon.assert.calledWith(executeScoreThresholdRuleStub, scoreThresholdRuleRequest);
    });

    it('should return rule set passed if all rules passed', async () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], false)));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5)));

      let executeEmailBlocklistRuleStub = sinon
        .stub(ruleService, 'executeEmailBlocklistRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, true, 4.5)));

      let executeScoreThresholdRuleStub = sinon
        .stub(ruleService, 'executeScoreThresholdRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5)));

      let response = await ruleService.executeRuleSet(ruleSetRequest);

      assert.isDefined(response, 'Execute rule set should return a response');
      assert.strictEqual(response.RulePassed, true, 'Rule set should pass');
    });

    it('should return rule set failed if one out of x rules fails', async () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], false)));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5)));

      let executeEmailBlocklistRuleStub = sinon
        .stub(ruleService, 'executeEmailBlocklistRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, false, 4.5)));

      let executeScoreThresholdRuleStub = sinon
        .stub(ruleService, 'executeScoreThresholdRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5)));

      let response = await ruleService.executeRuleSet(ruleSetRequest);

      assert.isDefined(response, 'Execute rule set should return a response');
      assert.strictEqual(response.RulePassed, false, 'Rule set should not pass');
    });

    it('should stop processing rules if rule fails and flag is set', async () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, Models.Rules.RuleType.EMAIL_BLOCKLIST),
          new Models.Rules.Rule(scoreThresholdRuleId, 0, Models.Rules.RuleType.SCORE_THRESHOLD)
        ], true)));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5)));

      let executeEmailBlocklistRuleStub = sinon
        .stub(ruleService, 'executeEmailBlocklistRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(emailBlocklistRuleId, false, 4.5)));

      let executeScoreThresholdRuleStub = sinon
        .stub(ruleService, 'executeScoreThresholdRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(scoreThresholdRuleId, true, 4.5)));

      let response = await ruleService.executeRuleSet(ruleSetRequest);

      assert.isDefined(response, 'Execute rule set should return a response');
      assert.strictEqual(response.RulePassed, false, 'Rule set should not pass');
      sinon.assert.notCalled(executeScoreThresholdRuleStub);
    });

    it('should throw an exception if there is an unsupported rule in the rule set', async () => {
      let getRuleSetStub = sinon
        .stub(ruleSetRepository, 'selectById')
        .returns(Promise.resolve(new Models.Rules.RuleSet(ruleSetId, 'Rule Set', [
          new Models.Rules.Rule(accountLockedRuleId, 0, Models.Rules.RuleType.ACCOUNT_LOCKED),
          new Models.Rules.Rule(emailBlocklistRuleId, 0, 9999)
        ], true)));

      let executeAccountLockedRuleStub = sinon
        .stub(ruleService, 'executeAccountLockedRule')
        .returns(Promise.resolve(new Models.Rules.ExecuteRuleResponse(accountLockedRuleId, true, 4.5)));

      return assert.isRejected(ruleService.executeRuleSet(ruleSetRequest), 'Unsupported rule type in rule set');
    });
  });
});
