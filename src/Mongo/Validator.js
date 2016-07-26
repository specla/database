'use strict';

class Validator {

  /**
   * Create new validator instance
   * @param  {Object} schema
   * @param  {Mixed}  data
   * @return {Validator}
   */
  constructor(schema, data){
    this.schema = schema;
    this.data = data;
    this.errors = [];

    this.validate(this.schema, this.data);
  }

  /**
   * Is the value a string?
   * @param  {Mixed}  value
   * @return {Boolean}
   */
  isString(value){
    return typeof value === 'string' || (value && value.prototype ? value.prototype.constructor === String : false) ? true : false;
  }

  /**
   * Is the value a number
   * @param  {Mixed}  value
   * @return {Boolean}
   */
  isNumber(value){
    return typeof value === 'number' || (value && value.prototype ? value.prototype.constructor === Number : false) ? true : false;
  }

  /**
   * Is the value a boolean
   * @param  {Mixed}  value
   * @return {Boolean}
   */
  isBoolean(value){
    return typeof value === 'boolean' || (value && value.prototype ? value.prototype.constructor === Boolean : false) ? true : false;
  }

  /**
   * Is the value an array
   * @param  {Mixed}  value
   * @return {Boolean}
   */
  isArray(value){
    return Array.isArray(value) || (value && value.prototype ? value.prototype.constructor === Array : false);
  }

  /**
   * Is the value an object
   * @param  {Mixed}  value
   * @return {Boolean}
   */
  isObject(value){
    return typeof value === 'object' && !(value instanceof Array) || (value && value.prototype ? value.prototype.constructor === Object : false) ? true : false;
  }

  /**
   * Check if a key is in the schema
   * @param  {String}   key
   * @param  {Mixed}    schema
   * @return {Boolean}
   */
  isKeyInSchema(key, schema){
    if(schema[key]){
      return true;
    } else {
      this.errors.push({ msg: 'The key '+key+' is not defined in the schema' });
      return false;
    }
  }

  /**
   * Validate a value as a string
   * @param  {String} key
   * @param  {Mixed}  value
   * @return {Undefined}
   */
  validateString(key, value){
    if(!this.isString(value)){
      this.errors.push({ msg: 'The key '+key+' should be a string' });
    }
  }

  /**
   * Validate a value as a number
   * @param  {String} key
   * @param  {Mixed}  value
   * @return {Undefined}
   */
  validateNumber(key, value){
    if(!this.isNumber(value)){
      this.errors.push({ msg: 'The key '+key+' should be a number' });
    }
  }

  /**
   * Validate a value as a boolean
   * @param  {String} key
   * @param  {Mixed}  value
   * @return {Undefined}
   */
  validateBoolean(key, value){
    if(!this.isBoolean(value)){
      this.errors.push({ msg: 'The key '+key+' should be a boolean' });
    }
  }

  /**
   * Validate a value as an array
   * @param  {String} key
   * @param  {Mixed}  value
   * @return {Undefined}
   */
  validateArray(key, value){
    if(!this.isArray(value)){
      this.errors.push({ msg: 'The key '+key+' should be an array' });
    }
  }

  /**
   * Validate a value as an object
   * @param  {String} key
   * @param  {Mixed}  value
   * @return {Undefined}
   */
  validateObject(key, value){
    if(!this.isObject(value)){
      this.errors.push({ msg: 'The key '+key+' should be an object' });
    }
  }

  /**
   * Compare the data against the schema
   * @param  {Mixed} item
   * @param  {Mixed} schema
   * @return {Undefined}
   */
  compare(item, schema){
    for(let key in schema){
      if(this.isString(schema[key])){
        this.validateString(key, item[key]);
      }

      if(this.isNumber(schema[key])){
        this.validateNumber(key, item[key]);
      }

      if(this.isBoolean(schema[key])){
        this.validateBoolean(key, item[key]);
      }


      if(this.isArray(schema[key])){
        this.validateArray(key, item[key]);
      }

      if(this.isObject(schema[key])){
        this.validateObject(key, item[key]);
      }
    }
  }

  /**
   * Validate the schema against the base data
   * @param  {Mixed} schema
   * @param  {Mixed} data
   * @return {Undefined}
   */
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
        if(this.isObject(schema[key]) && Object.keys(schema[key]).length > 0){
          this.validate(schema[key], item[key]);
        }
      }

      this.compare(item, schema);
    }

    return this;
  }

}

module.exports = Validator;
