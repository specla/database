'use strict';

let MongoClient = require('mongodb').MongoClient;
let ObjectId = require('mongodb').ObjectID;
let assert = require('assert');
let Validator = require('./Validator');

class QueryBuilder {

  /**
   * Setup the DB client
   * @param  {object} options
   * @return {void}
   */
  constructor(options){
    this.options = options;
    this.host = options.host;
    this.port = options.port || 27017;
    this.username = options.username || '';
    this.password = options.password || '';
    this.database = options.database;
    this.authSource = options.authSource;

    this.Model = require('./Model');
    this.Model.bindDatabase(this);

    this._db = null;
    this._stream = null;
    this._result = [];
    this.close = null;

    this.q = {
      collection: null,
      schema: null,
      model: null,
      method: null,
      where: {},
      sort: {},
      skip: 0,
      limit: 0,
      callback: (err, result) => {}
    };

  }

  /**
   * Run the constructed query
   * @return {void}
   */
  connect(){
    let url = 'mongodb://'+this.username+(this.username ? ':' : '')+this.password+(this.username ? '@' : '')+this.host+':'+this.port+'/'+this.database+(this.authSource !== undefined ? '?authSource='+this.authSource : '');

    // connnect and set a persistent connection
    if(this._db === null){
      MongoClient.connect(url, (err, db) => {
        assert.equal(null, err);
        this._db = db;
        this.close = () => {
          this._db = null;
          this._db.close();
          this.close = null;
        };
        this.query(db, () => {});
      });
    } else {
      this,query(this._db, () => {});
    }
  }

  /**
   * Construct the query for mongo
   * @param  {db}   db   the mongo db object
   * @param  {done} done this function closes the mongo connection
   * @return {void}
   */
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
      case 'stream':
        this._stream = db.collection(this.q.collection).find(this.q.where).stream();
        this._stream.on('data', (data) => {
          this._result.push(this.q.callback(data));
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

  /**
   * Define which collection the query should be run in
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  collection(name){
    let db = new QueryBuilder(this.options);
    db.q.collection = name;
    return db;
  }

  /**
   * Access the raw mongo object with the method
   * @param  {Function} callback
   * @return {void}
   */
  raw(callback){
    let db = new QueryBuilder(this.options);
    db.q.method = 'raw';
    db.q.callback = callback;
    db.connect();
  }

  /**
   * Construct where statement
   * @param  {string|object}    key
   * @param  {string|undefined} value
   * @return {this}
   */
  where(key, value){
    if(typeof key == 'object' && !(value instanceof Array)){
      this.q.where = key;
      return this;
    }

    if(key === '_id' || key === 'id'){
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

  /**
   * Construct skip statement
   * @param  {number} num
   * @return {this}
   */
  skip(num){
    this.q.skip = num;
    return this;
  }

  /**
   * Construct limit statement
   * @param  {number} num
   * @return {this}
   */
  limit(num){
    this.q.limit = num;
    return this;
  }

  /**
   * Construct short statement
   * @param  {string} key
   * @param  {string} order
   * @return {this}
   */
  sort(key, order){
    // TODO, should support multi sorting parameters
    this.q.sort[key] = (order == 'asc' || order == 'ASC' || order == 1 ? 1 : -1);
    return this;
  }

  /**
   * Construct insert statement
   * @param  {object|array} items
   * @param  {Function}     callback
   * @return {void}
   */
  insert(items, callback){
    if(!this.validate(items, callback)){
      return false;
    }

    if(callback === undefined){
      callback = (err, result) => {};
    }

    this.q.items = items;
    this.q.method = (items.length > 1 ? 'insertMany' : 'insert');
    this.q.callback = callback;

    for(let i = 0; i < this.q.items.length; i++){
      this.q.items[i]._id = ObjectId();
    }

    this.connect();
  }

  /**
   * Construct update statement
   * @param  {object|array} items
   * @param  {Function}     callback
   * @return {void}
   */
  update(set, callback){
    if(!this.validate(set, callback)){
      return false;
    }

    this.q.set = set;
    this.q.method = 'updateMany';
    this.q.callback = callback;
    this.connect();
  }

  /**
   * Construct remove statement
   * @param  {Function}  callback
   * @return {void}
   */
  remove(callback){
    this.q.method = 'removeMany';
    this.q.callback = callback;
    this.connect();
  }

  /**
   * Get the full data set from DB
   * @param  {Function}  callback
   * @return {void}
   */
  get(callback){
    this.q.method = 'find';
    this.q.callback = callback;
    this.connect();
  }

  /**
   * Stream data from mongo
   * @param  {Function}  callback
   * @return {DB}
   */
  stream(callback){
    this.q.method = 'stream';
    this.q.callback = callback;
    this.connect();
    return this;
  }

  /**
   * Register the end event at return the streaming result
   * @param  {Function} callback
   * @return {void}
   */
  done(callback){
    let int = setInterval(() => {
      try {
        this._stream.once('end', () => {
          callback(this._result);
        });

        clearInterval(int);
      } catch(err){}
    }, 1);
  }

  /**
   * Set the schema to validate against
   * @param  {object} schema
   * @return {DB}
   */
  schema(schema){
    this.q.schema = schema;
    return this;
  }

  /**
   * Validate the data against the schema
   * @param  {object|array} data
   * @param  {closure} callback
   * @return {boolean}
   */
  validate(data, callback){
    if(this.q.schema === null){
      return true;
    }

    if(callback === undefined){
      callback = () => {};
    }

    let validator = new Validator(this.q.schema, data);

    if(validator.errors.length){
      callback(validator.errors, null);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Register return data as models
   * @param  {object|array} items
   * @return {void}
   */
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

  /**
   * Set the model type as a query statement
   * @param  {object} model
   * @return {void}
   */
  model(model){
    this.q.model = model;
    return this;
  }
}

/**
 * Export the query builder
 * @type {object} QueryBuilder
 */
module.exports = QueryBuilder;
