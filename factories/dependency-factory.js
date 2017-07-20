"use strict";

const ConfigService = require('../services/cross-cutters/config-service');
const EmailService = require('../services/cross-cutters/email-service');
const IocContainer = require('node-ioc');
const MailerService = require('nodemailer');
const Repositories = require('../repositories');
const Services = require('../services');

var _defaultContainer = new IocContainer();

_defaultContainer.registerWithTypes().as(Repositories.DbContext).singleton();

_defaultContainer.registerWithTypes(Repositories.DbContext).as(Repositories.AccountRepository);
_defaultContainer.registerWithTypes(Repositories.DbContext).as(Repositories.BlockItemRepository);
_defaultContainer.registerWithTypes(Repositories.DbContext).as(Repositories.Rules.RuleRepository);
_defaultContainer.registerWithTypes(Repositories.DbContext).as(Repositories.Rules.RuleSetRepository);

_defaultContainer.register(() => MailerService).as(MailerService);
_defaultContainer.registerWithTypes().as(ConfigService);
_defaultContainer.registerWithTypes(ConfigService).as(Services.RestApi.GeolocationClient);
_defaultContainer.registerWithTypes(ConfigService).as(Services.RestApi.SplunkClient);
_defaultContainer.registerWithTypes(ConfigService, MailerService).as(EmailService);
_defaultContainer.registerWithTypes(Repositories.AccountRepository).as(Services.AccountService);
_defaultContainer.registerWithTypes(
  Services.AccountService,
  EmailService,
  Services.RestApi.GeolocationClient,
  Services.RestApi.SplunkClient,
  Repositories.AccountRepository,
  Repositories.BlockItemRepository,
  Repositories.Rules.RuleRepository,
  Repositories.Rules.RuleSetRepository).as(Services.RuleService);

module.exports = {
  resolve: function(type, container) {
    this._container = container !== undefined ? container : _defaultContainer;
    return this._container.resolve(type);
  }
}
