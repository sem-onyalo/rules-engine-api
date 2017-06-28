"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const AccountService = require('./account-service');
const GeolocationClient = require('./rest-api/geolocation-client');
const Models = require('../models');
const Repositories = require('../repositories')
const RuleService = require('./rule-service');

describe('RuleService', () => {
  let geolocationClient;
  let accountRepository;
  let blockItemRepository;
  let ruleRepository;
  let accountService;
  let ruleService;

  let geolocationClientStub;
  let accountRepositoryStub;
  let blockItemRepositoryStub;
  let accountServiceStub;
  let ruleRepositoryStub;

  beforeEach(function () {
    geolocationClient = new GeolocationClient();
    accountRepository = new Repositories.AccountRepository();
    blockItemRepository = new Repositories.BlockItemRepository();
    ruleRepository = new Repositories.Rules.RuleRepository();
    accountService = new AccountService();
    ruleService = new RuleService(accountService, geolocationClient, accountRepository, blockItemRepository, ruleRepository);
  });

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

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
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

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
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

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
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

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
      assert.strictEqual(ruleResponse.RuleScore, 0, 'Rule score was not set to expected value');
    });

    it('should run the email blocklist rule and return rule passed if email is not on blocklist', () => {
      let ruleId = 123, ruleScore = 2.5, email = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleId, email);

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(null);

      let ruleResponse = ruleService.executeRule(ruleRequest);

      blockItemRepositoryStub.restore();

      sinon.assert.calledOnce(blockItemRepositoryStub);
      sinon.assert.calledWith(blockItemRepositoryStub, Models.BlockItemType.Email, email);

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should run the email blocklist rule and return rule failed if email is on blocklist', () => {
      let ruleId = 123, ruleScore = 2.5, email = 'jdoe@nomail.com';
      let ruleRequest = new Models.Rules.ExecuteEmailBlocklistRuleRequest(ruleId, email);

      blockItemRepositoryStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(new Models.BlockItem(1, Models.BlockItemType.Email, 'jdoe@nomail.com'));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      blockItemRepositoryStub.restore();

      sinon.assert.calledOnce(blockItemRepositoryStub);
      sinon.assert.calledWith(blockItemRepositoryStub, Models.BlockItemType.Email, email);

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the account locked rule and return rule failed if account is locked', () => {
      let ruleId = 123, ruleScore = 0, accountId = 456, isAccountLocked = true;
      let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleId, accountId);

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(new Models.Account(accountId, isAccountLocked));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      accountRepositoryStub.restore();

      sinon.assert.calledOnce(accountRepositoryStub);
      sinon.assert.calledWith(accountRepositoryStub, accountId);

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });

    it('should run the account locked rule and return rule passed if account is not locked', () => {
      let ruleId = 123, ruleScore = 0, accountId = 456, isAccountLocked = false;
      let ruleRequest = new Models.Rules.ExecuteAccountLockedRuleRequest(ruleId, accountId);

      accountRepositoryStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(new Models.Account(accountId, isAccountLocked));

      let ruleResponse = ruleService.executeRule(ruleRequest);

      accountRepositoryStub.restore();

      sinon.assert.calledOnce(accountRepositoryStub);
      sinon.assert.calledWith(accountRepositoryStub, accountId);

      assert.isDefined(ruleResponse, 'ExecuteRuleResponse should be defined');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });
  });
});
