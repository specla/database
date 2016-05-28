'use strict';

const assert = require('assert');
const Database = require('../');


const Config = {
  travis: {
    host: '127.0.0.1',
    port: 27017,
    username: 'specla',
    password: 'password',
    database: 'mydb'
  },
  local: {
    host: '192.168.99.100',
    port: 32768,
    database: 'Specla'
  }
};

const DB = new Database(Config[process.env.CONFIG || 'local']);


describe('# Create a new instance of database', () => {
  if(process.env.CONFIG){
    it('Default driver should be Mongo', () => assert.equal('mongo', DB.options.driver));
    it('Host should be 127.0.0.1', () => assert.equal('127.0.0.1', DB.options.host));
    it('Port should be 27017', () => assert.equal(27017, DB.options.port));
    it('Username should be specla', () => assert.equal('specla', DB.options.username));
    it('Password should be password', () => assert.equal('password', DB.options.password));
    it('Database should be mydb', () => assert.equal('mydb', DB.options.database));
  } else {
    it('Default driver should be Mongo', () => assert.equal('mongo', DB.options.driver));
    it('Host should be 192.168.99.100', () => assert.equal('192.168.99.100', DB.options.host));
    it('Port should be 32768', () => assert.equal(32768, DB.options.port));
    it('Database should be Specla', () => assert.equal('Specla', DB.options.database));
  }
});
