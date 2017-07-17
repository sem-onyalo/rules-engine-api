"use strict";

const oracledb = require('oracledb');
const ConfigService = require('../services/cross-cutters/config-service');
const DbConfig = require('../config/db-config');

module.exports = {
  ping: function(cb) {
    openConn((conn) => {
      let status = conn !== null ? 'up' : 'down';
      if (conn !== null) closeConn(conn);
      cb('Databse connection is ' + status);
    });
  },

  query: function(queryString, queryParams, cb) {
    openConn(function(conn) {
      conn.execute(queryString, queryParams, (err, result) => {
        if (err) {
          console.error(err.message);
        }
        
        closeConn(conn);
        cb(result);
      });
    });
  }
}

function openConn(cb) {
  oracledb.getConnection({
    user: DbConfig.USER,
    password: DbConfig.PASS,
    connectString: DbConfig.CONNSTR
  }, (err, conn) => {
    if (err) {
      console.error(err.message);
    }

    cb(err ? null : conn);
  })
}

function closeConn(conn) {
  conn.close((err) => {
    if (err) {
      console.error(err);
    }
  });
}
