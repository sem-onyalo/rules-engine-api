"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const RuleType = require('./rule-type');

describe('RuleType', () => {
  it('should define the enums: NONE = 0, ACCOUNT_LOCKED = 1, EMAIL_BLOCKLIST = 2, SCORE_THRESHOLD = 3, DIFFERENT_EMAIL = 4, SOURCE_IP = 5, ORDERS_CREATED = 6, REQUESTS_FROM_IP = 7', () => {
    expect(RuleType).to.have.property('NONE');
    expect(RuleType).to.have.property('ACCOUNT_LOCKED');
    expect(RuleType).to.have.property('EMAIL_BLOCKLIST');
    expect(RuleType).to.have.property('SCORE_THRESHOLD');
    expect(RuleType).to.have.property('DIFFERENT_EMAIL');
    expect(RuleType).to.have.property('SOURCE_IP');
    expect(RuleType).to.have.property('ORDERS_CREATED');
    expect(RuleType).to.have.property('REQUESTS_FROM_IP');
  });
});
