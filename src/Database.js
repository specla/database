'use strict';

var Mongo = require('./Mongo');
var MySQL = require('./MySQL');

class Database {

  constructor(options){
    this.driver = null;
    this.options = options;
    this.connections = [];
  }

  connection(connection){
    switch(this.options[connection].driver){
      case 'mongo':
        return new Mongo(this.options[connection]);
        break;
      case 'mysql':
        break;
      default: 
        this.connection('mongo')
        break;
    }
  }

}

module.exports = Database;