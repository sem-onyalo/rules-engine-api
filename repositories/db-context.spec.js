"use strict";

const expect = require('chai').expect;

const DbContext = require('./db-context');

describe('DbContext', () => {
  describe('ping()', () => {
    it('should export function', () => {
      expect(DbContext.ping).to.be.a('function');
    });
  });

  describe('query(queryString, queryParams)', () => {
    it('should export function', () => {
      expect(DbContext.query).to.be.a('function');
    });
  });
});
