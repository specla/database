'use strict';

var Mongo = require('./Mongo/QueryBuilder');

class Database {

  constructor(options){
    options.driver = options.driver || 'mongo';
    this.driver = options.driver;
    this.options = options;

    this.validateOptions();
    return this.getDriver();
  }

  validateOptions(){
    if(this.options.host === undefined)
      throw new Error('Database: You need to specify a host address to connect to!');

    if(this.options.port === undefined)
      throw new Error('Database: You need to specify which port your DB is running on!');

    if(this.options.database === undefined)
      throw new Error('Database: You need to specify which database to connect to!');
  }

  getDriver(){
    if(this.driver === 'mongo' || this.driver === 'Mongo' ){
      return new Mongo(this.options);
    } else {
      throw new Error(`Database: The specified database driver "${this.driver}" is not available.`);
    }
  }

}


module.exports = Database;
