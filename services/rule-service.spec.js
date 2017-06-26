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
  let accountService;
  let geolocationClient;
  let ruleRepository;
  let ruleService;

  let accountServiceStub;
  let geolocationClientStub;
  let ruleRepositoryStub;

  beforeEach(function () {
    accountService = new AccountService();
    geolocationClient = new GeolocationClient();
    ruleRepository = new Repositories.Rules.RuleRepository();
    ruleService = new RuleService(accountService, geolocationClient, ruleRepository);
  });

  describe('executeRule(executeRuleRequest)', () => {
    it('should export function', () => {
      expect(ruleService.executeRule).to.be.a('function');
    });

    it('should return rule passed and rule score if countries from rule in repository and ip lookup match', () => {
      let ruleId = 123, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(1, ruleId, [country.Code]));

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

      assert.isNotNull(ruleResponse, 'ExecuteRuleResponse should not be null');
      assert.strictEqual(ruleResponse.IsRulePass, true, 'Rule should have passed');
    });

    it('should return rule not passed and rule score if countries from rule in repository and ip lookup match', () => {
      let ruleId = 123, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let ruleRequest = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);
      let ipRequest = new Models.RestApi.GeolocationIpLookupRequest(sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(1, ruleId, [country.Code]));

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

      assert.isNotNull(ruleResponse, 'ExecuteRuleResponse should not be null');
      assert.strictEqual(ruleResponse.IsRulePass, false, 'Rule should not have passed');
    });
  });
});
