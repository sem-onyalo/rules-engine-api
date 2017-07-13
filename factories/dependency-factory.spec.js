"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ConfigService = require('../services/cross-cutters/config-service');
const DependencyFactory = require('./dependency-factory');
const EmailService = require('../services/cross-cutters/email-service');
const IocContainer = require('node-ioc');
const MailerService = require('nodemailer');
const Repositories = require('../repositories');
const Services = require('../services');

describe('DependencyFactory', () => {
  describe('resolve(type[, container])', () => {
    it('should export function', () => {
      expect(DependencyFactory.resolve).to.be.a('function');
    });

    it('should resolve instance from a specified container', () => {
      class Apple {
        constructor(type) {
          this.type = type;
        }
        getInfo() {
          return this.type;
        }
      }

      class Orange {
        constructor() {
          this.type = 'orange';
        }
        getInfo() {
          return this.type;
        }
      }

      class Pear {
        constructor(type) {
          this.type = type;
        }
        getInfo() {
          return this.type;
        }
      }

      class FruitBowl {
        constructor(apple, orange, pear) {
          this.apple = apple;
          this.orange = orange;
          this.pear = pear;
        }
        getInfo() {
          return this.apple.getInfo() + ', ' + this.orange.getInfo() + ', ' + this.pear.getInfo();
        }
      }

      let container = new IocContainer();
      container.register(() => new Apple('royal gala')).as(Apple);
      container.register(() => new Pear('bartlett')).as(Pear);
      container.registerWithTypes().as(Orange);
      container.registerWithTypes(Apple, Orange, Pear).as(FruitBowl);

      let result = DependencyFactory.resolve(FruitBowl, container);

      assert.isDefined(result, 'Should returned defined class instance');
      expect(result).to.be.an.instanceof(FruitBowl);
      assert.strictEqual(result.getInfo(), 'royal gala, orange, bartlett');
    });

    it('should resolve AccountRepository', () => {
      let instance = DependencyFactory.resolve(Repositories.AccountRepository);
      expect(instance).to.be.an.instanceof(Repositories.AccountRepository);
    });

    it('should resolve BlockItemRepository', () => {
      let instance = DependencyFactory.resolve(Repositories.BlockItemRepository);
      expect(instance).to.be.an.instanceof(Repositories.BlockItemRepository);
    });

    it('should resolve RuleRepository', () => {
      let instance = DependencyFactory.resolve(Repositories.Rules.RuleRepository);
      expect(instance).to.be.an.instanceof(Repositories.Rules.RuleRepository);
    });

    it('should resolve RuleSetRepository', () => {
      let instance = DependencyFactory.resolve(Repositories.Rules.RuleSetRepository);
      expect(instance).to.be.an.instanceof(Repositories.Rules.RuleSetRepository);
    });

    it('should resolve GeolocationClient', () => {
      let instance = DependencyFactory.resolve(Services.RestApi.GeolocationClient);
      expect(instance).to.be.an.instanceof(Services.RestApi.GeolocationClient);
      expect(instance._configService).to.be.an.instanceof(ConfigService);
    });

    it('should resolve SplunkClient', () => {
      let instance = DependencyFactory.resolve(Services.RestApi.SplunkClient);
      expect(instance).to.be.an.instanceof(Services.RestApi.SplunkClient);
      expect(instance._configService).to.be.an.instanceof(ConfigService);
    });

    it('should resolve AccountService', () => {
      let instance = DependencyFactory.resolve(Services.AccountService);
      expect(instance).to.be.an.instanceof(Services.AccountService);
      expect(instance._accountRepository).to.be.an.instanceof(Repositories.AccountRepository);
    });

    it('should resolve ConfigService', () => {
      let instance = DependencyFactory.resolve(ConfigService);
      expect(instance).to.be.an.instanceof(ConfigService);
    });

    it('should resolve EmailService', () => {
      let instance = DependencyFactory.resolve(EmailService);
      expect(instance).to.be.an.instanceof(EmailService);
      expect(instance._configService).to.be.an.instanceof(ConfigService);
      expect(instance._mailerService).to.deep.equal(MailerService);
    });

    it('should resolve MailerService', () => {
      let instance = DependencyFactory.resolve(MailerService);
      expect(instance).to.deep.equal(MailerService);
    });

    it('should resolve RuleService', () => {
      let instance = DependencyFactory.resolve(Services.RuleService);
      expect(instance).to.be.an.instanceof(Services.RuleService);
      expect(instance._accountService).to.be.an.instanceof(Services.AccountService);
      expect(instance._emailService).to.be.an.instanceof(EmailService);
      expect(instance._geolocationClient).to.be.an.instanceof(Services.RestApi.GeolocationClient);
      expect(instance._splunkClient).to.be.an.instanceof(Services.RestApi.SplunkClient);
      expect(instance._accountRepository).to.be.an.instanceof(Repositories.AccountRepository);
      expect(instance._blockItemRepository).to.be.an.instanceof(Repositories.BlockItemRepository);
      expect(instance._ruleRepository).to.be.an.instanceof(Repositories.Rules.RuleRepository);
      expect(instance._ruleSetRepository).to.be.an.instanceof(Repositories.Rules.RuleSetRepository);
    });
  });
});
