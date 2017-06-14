"use strict";

const BlockitemRepository = require('./blockitem-repository');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('BlockItemRepository', () => {
  describe('selectByTypeAndValue()', () => {
    it('should export function', () => {
      let blockitemRepository = new BlockitemRepository();
      expect(blockitemRepository.selectByTypeAndValue).to.be.a('function');
    });
  });
});
