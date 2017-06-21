"use strict"

const assert = require('chai').assert;
const expect = require('chai').expect;

const DsObject = require('./ds-object');

describe('DsObject', () => {
  it('should define properties: Id', () => {
    let dsObject = new DsObject();
    expect(dsObject).to.have.property('Id');
  });

  it('should set the defined properties on initialization', () => {
    let dsObject = new DsObject(1);
    assert.strictEqual(dsObject.Id, 1, 'Id was not set to the expected value');
  });
});
