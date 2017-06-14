"use strict";

const BlockItemType = require('./blockitemtype');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('BlockItemType', () => {
  it('should have expected enum values: None = 0, Email = 1', () => {
    expect(BlockItemType).to.have.property('None');
    expect(BlockItemType).to.have.property('Email');
    assert.strictEqual(BlockItemType.None, 0, 'BlockItemType.None does not equal 0');
    assert.strictEqual(BlockItemType.Email, 1, 'BlockItemType.Email does not equal 1');
  });
});
