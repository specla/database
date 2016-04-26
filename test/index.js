'use strict';
var assert = require('assert');
var Database = require('../src/database');
var Mongo = require('../src/mongo');


var DB = new Mongo({
  host: '192.168.99.100',
  port: 32768,
  database: 'Specla'
});

DB.raw((db, close) => {
  var cursor = db.collection('users').find({}).sort({});
  cursor.each((err, doc) => {
    if(doc !== null){
      console.log(doc);
    } else {
      close();
    }
  });
});
