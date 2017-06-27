"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const DsObject = require('../ds').DsObject;
const Rule = require('./rule');

describe('Rule', () => {
  it('should inherit DsObject', () => {
    let rule = new Rule();
    expect(rule).to.be.an.instanceof(DsObject);
  });

  it('should define the properties: Id, Score', () => {
    let rule = new Rule();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Score');
  });

  it('should set the defined properties on initialization', () => {
    let rule = new Rule(123, 2.5);
    assert.strictEqual(rule.Id, 123, 'Id was not set to expected value on init');
    assert.strictEqual(rule.Score, 2.5, 'Score was not set to expected value on init');
  });
});
