'use strict';

class Model {

  /**
   * Construct new user
   * @param  {Object} data
   * @return {Model}
   */
  constructor(data){
    this.DB = Model.DB;
    this.data = data || {};
  }

  /**
   * Defines the collection name
   * @return {String}
   */
  collection(){
    let name = this.constructor.name;
    return name.charAt(0).toLowerCase() + name.slice(1) + 's';
  }

  /**
   * Defines the schema
   * @return {Object|Null}
   */
  schema(){
    return null;
  }

  /**
   * Bind the QueryBuilder to the Model
   * @param  {Object} DB
   * @return {Model}
   */
  static bindDatabase(DB){
    this.DB = DB;
    return this;
  }

  /**
   * Get the data attributes for a model
   * @param  {Object|String} key
   * @return {Mixed}
   */
  get(key){
    if(key === undefined){
      return this.data;
    } else {
      return this.data[key];
    }
  }

  /**
   * Set data attributes for a model
   * @param {String|Object} key
   * @param {Mixed} value
   * @return {Model}
   */
  set(key, value){
    if(!key && !value){
      return this;
    }

    if(value === undefined && typeof key === 'object'){
      if(this.data._id !== undefined){
        key._id = this.data._id;
      }

      this.data = key;
    } else {
      this.data[key] = value;
    }
    return this;
  }

  /**
   * Write model attributes to MongoDB
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  save(callback){
    if(callback === undefined){
      callback = () => {};
    }

    if(this.data._id !== undefined){
      return this.update(callback);
    }


    this.DB.collection(this.collection()).schema(this.schema()).insert(this.data, (err, result) => {
      this.data = result.ops[0];
      callback(err, this);
    });
  }

  /**
   * Update data attributes in MongoDB
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  update(callback){
    let id = this.data._id;
    delete this.data._id;
    this.DB.collection(this.collection()).schema(this.schema()).where('_id', id).update(this.data, (err, result) => {
      callback(err, this);
    });
  }

  /**
   * Delete a model from MongoDB
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  delete(callback){
    if(this.data._id === undefined){
      throw new Error('Model: id needs to be specified before the delete method works');
    }

    if(callback === undefined){
      callback = () => {};
    }

    this.DB.collection(this.collection()).schema(this.schema()).where('_id', this.data._id).remove((err, result) => {
      callback(err, result)
    });
  }

  /**
   * Find a Model in MongoDB
   * @param  {String} id
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  static find(id, callback){
    let model = new this;

    model.DB.collection(model.collection()).schema(model.schema()).model(this).where('_id', id).get((err, result) => {
      callback(err, result[0]);
    });
  }

  /**
   * Get all models from MongoDB
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  static all(callback){
    let model = new this;

    model.DB.collection(model.collection()).schema(model.schema()).model(this).get((err, items) => {
      callback(err, items);
    });
  }

  /**
   * Alias for Model.all()
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  static get(callback){
    this.all(callback);
  }

  /**
   * Where query on model
   * @param  {String|Object} key
   * @param  {String} value
   * @return {Model}
   */
  static where(key, value){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).where(key, value);
  }

  /**
   * Sort query on model
   * @param  {String} key
   * @param  {String} order
   * @return {Model}
   */
  static sort(key, order){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).sort(key, order);
  }

  /**
   * Skip query on model
   * @param  {Number} num
   * @return {Model}
   */
  static skip(num){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).skip(num);
  }

  /**
   * Limit query on model
   * @param  {Number} num
   * @return {Model}
   */
  static limit(num){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).limit(num);
  }

  /**
   * Insert models as documents in MongoDB
   * @param  {Object|Array} data
   * @param  {Function|Undefined|Undefined}     callback
   * @return {Undefined}
   */
  static insert(data, callback){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).insert(data, callback);
  }

  /**
   * Update models in MongoDB
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  static update(callback){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).update(callback);
  }

  /**
   * Remove models from MongoDB
   * @param  {Function|Undefined} callback
   * @return {Undefined}
   */
  static remove(callback){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).remove(callback);
  }

}

module.exports = Model;
