'use strict';
var assert = require('assert');
var Mongo = require('../../src/mongo');

var DB = new Mongo({
  host: '192.168.99.100',
  port: 32768,
  database: 'Specla'
});


DB.collection('users').where('_id', '571b9a8f94a954f008b87b4e').update();

// DB.collection('users').skip(1).limit(2).get((err, data) => {
//   console.log(data);
// });

// DB.raw((db, done) => {
//   var cursor = db.collection('users').find();
//   cursor.each((err, data) => {
//     if(data != null){
//       console.log(data);
//     } else {
//       done();
//     }
//   });
// });

// DB.raw((db, close) => {
//   var cursor = db.collection('users').find().sort({});
//   var data = [];
//   cursor.each((err, doc) => {
//     assert.equal(err, null);
//     if (doc != null) {
//       data.push(doc);
//     } else {
//       console.log(data);
//       close(); // close connection
//     }
//   });
// });

// DB.collection('users').updateMany({ name: 'L' }, { $set: { name: 'Lise' } }, function(result, err) {
//   console.log(result);
// });
