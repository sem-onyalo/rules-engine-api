"use strict";

const AccountRepository = require('./account-repository');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('AccountRepository', () => {
  describe('selectById()', () => {
    it('should export function', () => {
      let accountRepository = new AccountRepository();
      expect(accountRepository.selectById).to.be.a('function');
    });
  });
});
