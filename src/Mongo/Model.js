'use strict';

class Model {

  constructor(data){
    this.DB = Model.DB;
    this.data = data || {};
  }

  collection(){
    return this.constructor.name.toLowerCase()+'s';
  }

  schema(){
    return null;
  }

  static bindDatabase(DB){
    this.DB = DB;
    return this;
  }

  set(key, value){
    this.data[key] = value;
    return this;
  }

  get(key){
    return this.data[key];
  }

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

  update(callback){
    let id = this.data._id;
    delete this.data._id;
    this.DB.collection(this.collection()).schema(this.schema()).where('_id', id).update(this.data, (err, result) => {
      callback(err, this);
    });
  }

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

  static find(id, callback){
    let model = new this;

    model.DB.collection(model.collection()).schema(model.schema()).model(this).where('_id', id).get((err, result) => {
      callback(err, result[0]);
    });
  }

  static all(callback){
    let model = new this;

    model.DB.collection(model.collection()).schema(model.schema()).model(this).get((err, items) => {
      callback(err, items);
    });
  }

  static get(callback){
    this.all(callback);
  }

  static where(key, value){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).where(key, value);
  }

  static sort(key, order){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).sort(key, order);
  }

  static skip(num){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).skip(num);
  }

  static limit(num){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).limit(num);
  }

  static insert(data, callback){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).insert(data, callback);
  }

  static update(callback){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).update(callback);
  }

  static remove(callback){
    let model = new this;
    return model.DB.collection(model.collection()).schema(model.schema()).model(this).remove(callback);
  }

}

module.exports = Model;
