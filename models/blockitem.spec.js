"use strict";

const BlockItemType = require('./blockitemtype');
const BlockItem = require('./blockitem');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('BlockItem', () => {
  it('should have the properties: Id, Type, Value', () => {
    let blockItem = new BlockItem();
    expect(blockItem).to.have.property('Id');
    expect(blockItem).to.have.property('Type');
    expect(blockItem).to.have.property('Value');
  });

  it('should set the properties as expected', () => {
    let blockItem = new BlockItem(123, BlockItemType.Email, 'jdoe@nomail.com');
    assert.strictEqual(blockItem.Id, 123, 'BlockItem.Id does not equal expected value');
    assert.strictEqual(blockItem.Type, BlockItemType.Email, 'BlockItem.Type does not equal expected value');
    assert.strictEqual(blockItem.Value, 'jdoe@nomail.com', 'BlockItem.Value does not equal exptected value');
  });
});
