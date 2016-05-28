'use strict';

const assert = require('assert');
const Database = require('../');


const DB = new Database({
  host: '127.0.0.1',
  port: 27017,
  username: 'specla',
  password: 'password',
  database: 'mydb'
});


describe('# Create a new instance of database', () => {
  //it('Default driver should be Mongo', () => assert.equal('Mongo', DB.constructor.name));
  it('Host should be 127.0.0.1', () => assert.equal('127.0.0.1', DB.options.host));
  it('Port should be 27017', () => assert.equal(27017, DB.options.port));
  it('Username should be specla', () => assert.equal('specla', DB.options.username));
  it('Password should be password', () => assert.equal('password', DB.options.password));
  it('Database should be mydb', () => assert.equal('mydb', DB.options.database));
});
