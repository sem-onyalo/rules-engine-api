"use strict";

const BlockItemRepository = require('./block-item-repository');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('BlockItemRepository', () => {
  describe('selectByTypeAndValue(type, value)', () => {
    it('should export function', () => {
      let blockItemRepository = new BlockItemRepository();
      expect(blockItemRepository.selectByTypeAndValue).to.be.a('function');
    });
  });
});
