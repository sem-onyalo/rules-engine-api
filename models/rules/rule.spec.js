"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const DsObject = require('../ds').DsObject;
const Rule = require('./rule');
const RuleType = require('./rule-type');

describe('Rule', () => {
  it('should inherit DsObject', () => {
    let rule = new Rule();
    expect(rule).to.be.an.instanceof(DsObject);
  });

  it('should define the properties: Id, Score, EmailOnFail', () => {
    let rule = new Rule();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Type');
    expect(rule).to.have.property('Score');
    expect(rule).to.have.property('EmailOnFail');
    expect(rule).to.have.property('EmailTo');
    expect(rule).to.have.property('EmailSubject');
    expect(rule).to.have.property('EmailBody');
  });

  it('should set the defined properties on initialization', () => {
    let rule = new Rule(123, 2.5, RuleType.NONE, false, 'fraudteam@nomail.com', 'Rule Failure', 'A rule failed');
    assert.strictEqual(rule.Id, 123, 'Id was not set to expected value');
    assert.strictEqual(rule.Type, RuleType.NONE, 'Type was not set to expected value');
    assert.strictEqual(rule.Score, 2.5, 'Score was not set to expected value');
    assert.strictEqual(rule.EmailOnFail, false, 'EmailOnFail was not set to expected value');
    assert.strictEqual(rule.EmailTo, 'fraudteam@nomail.com', 'EmailTo was not set to expected value');
    assert.strictEqual(rule.EmailSubject, 'Rule Failure', 'EmailSubject was not set to expected value');
    assert.strictEqual(rule.EmailBody, 'A rule failed', 'EmailBody was not set to expected value');
  });
});
