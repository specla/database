class Optional {

}

global.Optional = Optional;

class Validator {

  constructor(schema, data){
    this.schema = schema;
    this.data = data;
    this.errors = [];

    this.validate(this.schema, this.data);
  }

  isString(value){
    return typeof value === 'string' || (value && value.prototype ? value.prototype.constructor === String : false) ? true : false;
  }

  isNumber(value){
    return typeof value === 'number' || (value && value.prototype ? value.prototype.constructor === Number : false) ? true : false;
  }

  isBoolean(value){
    return typeof value === 'boolean' || (value && value.prototype ? value.prototype.constructor === Boolean : false) ? true : false;
  }

  isArray(value){
    return Array.isArray(value) || (value && value.prototype ? value.prototype.constructor === Array : false);
  }

  isObject(value){
    return typeof value === 'object' && !(value instanceof Array) || (value && value.prototype ? value.prototype.constructor === Object : false) ? true : false;
  }

  isKeyInSchema(key, schema){
    if(schema[key]){
      return true;
    } else {
      this.errors.push({ msg: 'The key '+key+' is not defined in the schema' });
      return false;
    }
  }

  validateString(key, value){
    if(!this.isString(value)){
      this.errors.push({ msg: 'The key '+key+' should be a string' });
    }
  }

  validateNumber(key, value){
    if(!this.isNumber(value)){
      this.errors.push({ msg: 'The key '+key+' should be a number' });
    }
  }

  validateBoolean(key, value){
    if(!this.isBoolean(value)){
      this.errors.push({ msg: 'The key '+key+' should be a boolean' });
    }
  }

  validateArray(key, value){
    if(!this.isArray(value)){
      this.errors.push({ msg: 'The key '+key+' should be an array' });
    }
  }

  validateObject(key, value){
    if(!this.isObject(value)){
      this.errors.push({ msg: 'The key '+key+' should be an object' });
    }
  }

  compare(item, schema){
    for(let key in schema){
      if(this.isString(schema[key])){
        console.log('Checking for string '+key);
        this.validateString(key, item[key]);
      }

      if(this.isNumber(schema[key])){
        console.log('Checking for number '+key);
        this.validateNumber(key, item[key]);
      }

      if(this.isBoolean(schema[key])){
        console.log('Checking for boolean '+key);
        this.validateBoolean(key, item[key]);
      }


      if(this.isArray(schema[key])){
        console.log('Checking for array '+key);
        this.validateArray(key, item[key]);
      }

      if(this.isObject(schema[key])){
        console.log('Checking for object '+key);
        this.validateObject(key, item[key]);
      }
    }
  }

  validate(schema, data){
    if(this.isArray(schema)){
      schema = schema[0];
    }

    if(!this.isArray(data)){
      data = [data];
    }

    for(let i = 0, item; item = data[i]; i++){
      for(let key in item){
        this.isKeyInSchema(key, schema);

        if(this.isArray(schema[key]) && (schema[key].prototype ? schema[key].prototype.constructor !== Array : true)){
          this.validate(schema[key], item[key]);
        }

        // TODO finish object
        if(this.isObject(schema[key])){
          this.validate(schema[key], item[key]);
        }
      }

      this.compare(item, schema);
    }

    return this;
  }

}

module.exports = Validator;
