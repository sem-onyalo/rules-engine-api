"use strict";

const Config = require('../../config');
const ConfigService = require('./config-service');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('ConfigService', () => {
  let configService;

  beforeEach(function () {
    configService = new ConfigService();
  });

  it('should not be null', () => {
    assert.isNotNull(configService, 'Config service instance is null');
  });

  describe('getSetting(type, key)', () => {
    it('should export function', () => {
      expect(configService.getSetting).to.be.a('function');
    });
  });
});
