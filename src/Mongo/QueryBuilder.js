'use strict';

let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;
let assert = require('assert');

class QueryBuilder {

  constructor(options){
    this.options = options;
    this.host = options.host;
    this.port = options.port;
    this.username = options.username || '';
    this.password = options.password || '';
    this.database = options.database;

    this.Model = require('./Model');
    this.Model.bindDatabase(this);

    this.q = {
      collection: null,
      model: null,
      method: null,
      where: {},
      sort: {},
      skip: 0,
      limit: 0,
      callback: (err, result) => {}
    };

  }


  connect(){
    let url = 'mongodb://'+this.username+(this.username ? ':' : '')+this.password+(this.username ? '@' : '')+this.host+':'+this.port+'/'+this.database;

    if(!this.q.collection)
      throw new Error('Database: No collection specified');

    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      this.query(db, () => {
        db.close();
      });
    });
  }

  query(db, done){
    if(this.q.callback === undefined){
      this.q.callback = () => {};
    }

    switch(this.q.method){
      case 'find':
        let cursor = db.collection(this.q.collection)[this.q.method](this.q.where).limit(this.q.limit).skip(this.q.skip).sort(this.q.sort);
        let data = [];
        cursor.each((err, doc) => {
          assert.equal(err, null);
          if (doc != null) {
            data.push(doc);
          } else {
            this.q.callback(err, this.registerModels(data));
            done();
          }
        });
        break;
      case 'insert':
      case 'insertOne':
      case 'insertMany':
        db.collection(this.q.collection)[this.q.method](this.q.items, (err, result) => {
          this.q.callback(err, this.registerModels(result));
          done();
        });
        break;
      case 'update':
      case 'updateOne':
      case 'updateMany':
        db.collection(this.q.collection)[this.q.method](this.q.where, { $set: this.q.set }, (err, result) => {
          this.q.callback(err, this.registerModels(result));
          done();
        });
        break;
      case 'remove':
      case 'removeOne':
      case 'removeMany':
        db.collection(this.q.collection)[this.q.method](this.q.where, (err, result) => {
          this.q.callback(err, this.registerModels(result));
          done();
        });
        break;
      case 'raw':
        this.q.callback(db, done);
        break;
      default:
        break;
    }
  }

  collection(name){
    let db = new QueryBuilder(this.options);
    db.q.collection = name;
    return db;
  }


  raw(callback){
    let db = new QueryBuilder(this.options);
    db.q.method = 'raw';
    db.q.callback = callback;
    db.connect();
  }


  where(key, value){
    if(typeof key == 'object'){
      this.q.where = key;
      return this;
    }

    if(key === '_id'){
      if(value instanceof Array){
        let result = [];
        for(let i = 0, item; item = value[i]; i++){ result.push(ObjectId(item)); }
        value = result;
      } else {
        value = ObjectId(value);
      }
    }

    if(value instanceof Array){
      this.q.where[key] = { $in: value };
    } else {
      this.q.where[key] = value;
    }

    return this;
  }


  skip(num){
    this.q.skip = num;
    return this;
  }


  limit(num){
    this.q.limit = num;
    return this;
  }

  sort(key, order){
    this.q.sort[key] = (order == 'asc' || order == 'ASC' || order == 1 ? 1 : -1);
    return this;
  }


  insert(items, callback){
    if(callback === undefined){
      callback = (err, result) => {};
    }

    this.q.items = items;
    this.q.method = 'insert';
    this.q.callback = callback;

    for(let i = 0; i < this.q.items.length; i++){
      this.q.items[i]._id = ObjectId();
    }

    this.connect();
  }


  update(set, callback){
    this.q.method = 'update';
    this.q.set = set;
    this.q.callback = callback;
    this.connect();
  }


  remove(callback){
    this.q.method = 'remove';
    this.q.callback = callback;
    this.connect();
  }


  get(callback){
    this.q.method = 'find';
    this.q.callback = callback;
    this.connect();
  }

  registerModels(data){
    if(!this.q.model){
      return data;
    }

    let models = [], tmp;
    for(let i = 0, item; item = data[i]; i++){
      tmp = new this.q.model;
      tmp.data = item;
      models.push(tmp);
    }

    return models;
  }

  model(model){
    this.q.model = model;
    return this;
  }
}

module.exports = QueryBuilder;
