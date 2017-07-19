"use strict";

const oracledb = require('oracledb');
const ConfigService = require('../services/cross-cutters/config-service');
const DbConfig = require('../config/db-config');

module.exports = class DbContext {
  constructor() { }

  async ping() {
    let conn = await this.openConn();
    let status = conn !== null;
    if (conn !== null) await this.closeConn(conn);
    return status;
  }

  async query(queryString, queryParams) {
    let conn = await this.openConn();
    let result = await conn.execute(queryString, queryParams);
    await this.closeConn(conn);
    return result;
  }

  async openConn() {
    try {
      return await oracledb.getConnection({
        user: DbConfig.USER,
        password: DbConfig.PASS,
        connectString: DbConfig.CONNSTR
      });
    } catch (ex) {
      console.error(ex);
      return null;
    }
  }

  async closeConn(conn) {
    try {
      await conn.close();
    } catch (ex) {
      console.error(ex);
    }
  }
}
