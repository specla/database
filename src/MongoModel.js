'use strict';

class Model {

  constructor(data){
    this.DB = Model.DB;
    this.data = data || {};
  }

  static bindDatabase(DB){
    this.DB = DB;
    return this;
  }

  register(data){
    this.data = data;
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
    if(this.data._id !== undefined){
      return this.update(callback);
    }

    this.DB.collection(this.collection()).insert(this.data, (err, result) => {
      if(err !== null){
        throw new Error(err);
      }

      this.register(result.ops[0]);
      callback(this);
    });
  }

  update(callback){
    let id = this.data._id;
    delete this.data._id;
    this.DB.collection(this.collection()).where('id', id).update(this.data, (err, result) => {
      if(err !== null){
        throw new Error(err);
      }

      this.register(result.ops[0]);
      callback(this);
    });
  }

  delete(callback){
    if(this.data._id === undefined){
      throw new Error('Model: id needs to be specified before the delete method works');
    }

    this.DB.collection(this.collection()).where('_id', this.data._id).remove((err, result) => {
      if(err){
        throw new Error(err);
      }

      callback(result)
    });
  }

  static find(id, callback){
    let model = new this;

    model.DB.collection(model.collection()).where('_id', id).get((err, result) => {
      if(result.length === 0){
        throw new Error('Model: Couldn\'t find the model');
      }

      if(err){
        throw new Error(err);
      }

      callback(model.register(result[0]));
    });
  }

  static all(callback){
    let model = new this;

    model.DB.collection(model.collection()).get((err, items) => {
      if(err){
        throw new Error(err);
      }

      let result = [], tmp;
      for(let i = 0, item; item = items[i]; i++){
        tmp = new this;
        result.push(tmp.register(item));
      }
      callback(result);
    });
  }

}

module.exports = Model;
