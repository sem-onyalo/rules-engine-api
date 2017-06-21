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

    it('should call the geolocation client, compare the country code in the rule and geolocation, and return ...', () => {
      let ruleId = 123, sourceIp = '127.0.0.1';
      let country = new Models.Country(1, 'CA');
      let request = new Models.Rules.ExecuteSourceIpRuleRequest(ruleId, sourceIp);

      ruleRepositoryStub = sinon
        .stub(ruleRepository, 'selectById')
        .returns(new Models.Rules.RuleSourceIp(1, ruleId, [country.Code]));

      ruleService.executeRule(request);

      ruleRepositoryStub.restore();
    });
  });
});
