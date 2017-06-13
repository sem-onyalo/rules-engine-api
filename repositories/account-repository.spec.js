"use strict";

const AccountRepository = require('./account-repository');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('Account repository', () => {
  describe('selectById', () => {
    it('should export function', () => {
      const accountRepository = new AccountRepository();
      expect(accountRepository.selectById).to.be.a('function');
    });
  });
});
