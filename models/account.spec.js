"use strict";

const Account = require('./account');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('Account model', () => {
  it('should have expected parameters', () => {
    const account = new Account(123, false);
    expect(account).to.have.property('Id');
    expect(account).to.have.property('IsLocked');
  });

  it('should set the model parameters', () => {
    const account = new Account(123, false);
    assert.strictEqual(account.Id, 123, 'Account.Id was not set to the expected value');
    assert.strictEqual(account.IsLocked, false, 'Account.IsLocked was not set the the expected value');
  });
});
