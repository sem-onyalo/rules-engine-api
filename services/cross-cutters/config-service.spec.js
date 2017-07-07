"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ConfigService = require('./config-service');

describe('ConfigService', () => {
  let configService;

  beforeEach(function () {
    configService = new ConfigService();
  });

  describe('getSetting(type, key)', () => {
    it('should export function', () => {
      expect(configService.getSetting).to.be.a('function');
    });
  });
});
