'use strict';

var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
var assert = require('assert');

class Mongo {

  constructor(options){
    this.options = options;
    this.host = options.host;
    this.port = options.port;
    this.username = options.username;
    this.password = options.password;
    this.database = options.database;

    this.q = {
      collection: null,
      method: null,
    };
  }


  connect(){
    var url = 'mongodb://'+this.host+':'+this.port+'/'+this.database;
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      this.query(db, function(){
        db.close();
      });
    });
  }

  query(db, done){
    switch(this.q.method){
      case 'find':
        var cursor = db.collection(this.q.collection)[this.q.method](this.q.item);
        var data = [];
        cursor.each((err, doc) => {
          assert.equal(err, null);
          if (doc != null) {
            data.push(doc);
          } else {
             this.q.callback(err, data);
             done();
          }
        });
        break;
      case 'insert':
      case 'insertOne':
      case 'insertMany':
        db.collection(this.q.collection)[this.q.method](this.q.item, (err, result) => {
          this.q.callback(err, result);
          done();
        });
        break;
      case 'update':
      case 'updateOne':
      case 'updateMany':
        db.collection(this.q.collection)[this.q.method](this.q.where, this.q.set, (err, result) => {
          this.q.callback(err, result);
          done();
        });
        break;
      case 'remove':
      case 'removeOne':
      case 'removeMany':
        db.collection(this.q.collection)[this.q.method](this.q.item, (err, result) => {
          this.q.callback(err, result);
          done();
        });
        break;
      default:
        break;
    }
  }

  collection(name){
    var db = new Mongo(this.options);
    db.q.collection = name;
    return db;
  }


  insert(item, callback, method){
    if(!method){
      method = 'insert';
    }

    this.q.method = method;
    this.q.item = item;
    this.q.item._id = ObjectId();
    this.q.callback = callback;
    this.connect();
  }


  insertOne(item, callback){
    this.insert(item, callback, 'insertOne');
  }


  insertMany(item, callback){
    this.insert(item, callback, 'insertMany');
  }


  update(where, set, callback, method){
    if(!method){
      method = 'update';
    }

    this.q.method = method;
    this.q.where = where;
    this.q.set = set;
    this.q.callback = callback;
    this.connect();
  }


  updateOne(where, set, callback){
    this.update(where, set, callback, 'updateOne');
  }


  updateMany(where, set, callback){
    this.update(where, set, callback, 'updateMany');
  }

  remove(item, callback, method){
    if(!method){
      method = 'remove';
    }

    this.q.method = method;
    this.q.item = item;
    this.q.callback = callback;
    this.connect();
  }


  removeOne(item, callback){
    this.remove(item, callback, 'removeOne');
  }


  removeMany(item, callback){
    this.remove(item, callback, 'removeMany');
  }


  find(item, callback){
    if(callback === undefined){
      callback = item;
      item = undefined;
    }

    this.q.method = 'find';
    this.q.item = item;
    this.q.callback = callback;
    this.connect();
  }
}

module.exports = Mongo;