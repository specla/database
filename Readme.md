# Specla database

[![Build Status](https://travis-ci.org/Specla/Database.svg?branch=master)](https://travis-ci.org/Specla/Database)

This module is the database handler for the Specla Framework, its like Laravels
Eloquent but just for javascript and MongoDB.


### Setup

To install specla-database all you have to do is to download it via npm.
```sh
npm install specla-database --save
```
```js
let Database = require('specla-database');

const DB = new Database({
  driver: 'mongo',
  host: '127.0.0.1',
  port: 27017,
  database: 'MyDB'
});
```


# Usage
Specla database includes two modules the `Query builder` and the `DB.Model`.


# Query builder

#### Fetch data
```js
DB.collection('users').get((err, result) => {
  // Return all users at once
});
```

#### Stream data
```js
DB.collection('users').stream((user) => {
  // do something with the data
  return user;
}).done((result) => {
  // returns the streamed data in an array
});
```

#### Validate against schema
```js
let schema = {
  name: String,
  age: Number,
  address: {
    city: String,
  },
  skills: Array,
  admin: Boolean,
};

DB.collection('users')
  .schema(schema)
  .insert({
    name: 'Frederik',
    age: 22,
    address: {
      city: 'Odense',
    },
    skills: ['Javascript'],
    admin: true
  }, (err, result) => {
    // do something when the operation is completed
  });
```

#### Wheres
```js
DB.collection('users')
  .where('name', 'John')
  .get((err, result) => {
    // do something with the data
  });
```
It's also possible to just parse an object to the `where()` like below
```js
.where({ name: 'John' })
```

#### Sort
```js
.sort('name', 'ASC')
```

#### Skip and limit
```js
.skip(5)
.limit(10)
```

#### Insert
```js
let data = {
  name: 'John',
};

DB.collection('users')
  .insert(data, (err, result) => {
    // Do something after data is inserted
  });
```

#### Update
```js
let data = {
  name: 'John',
};

DB.collection('users')
  .where('_id', '5748aa5d45af47fc9909310b')
  .update(data, (err, result) => {
    // Do something after data is updated
  });
```

#### Remove
```js
DB.collection('users')
  .where('_id', '5748aa5d45af47fc9909310b')
  .remove((err, result) => {
    // Do something after data is removed
  });
```

#### Raw
If there is some Mongo functionality which isn't supported yet in this module, you can then use the raw method and have full access to the Mongo object.
> Its important to notice when youre using the raw method, you have to manually close the db connection with the `done` callback

```js
DB.raw((db, done) => {
  var cursor = db.collection('users').find({});

  cursor.each((err, doc) => {
    if(doc !== null){
      console.log(doc);
    } else {
      done(); // CLOSE CONNECTION!!!!
    }
  });
})
```


# Models
```js
// the simplest model you can create
class User extends DB.Model {

  collection(){
    return 'users';
  }

  // the schema is optional
  schema(){
    return {
      name: String,
      age: Number
    };
  }

}
```

#### Create
```js
let user = new User;
user.set('name', 'John');
user.save(() => {
  // do something when you user is created
  console.log(user.get('_id'));
});
```

#### Find
```js
User.find('5748aa5d45af47fc9909310b', (err, user) => {
  // do something with the user
});
```

#### Update
```js
User.find('5748aa5d45af47fc9909310b', (err, user) => {
  user.set('name', 'Frederik');
  user.save(() => {
    // do something
  });
});
```

#### delete
```js
User.find('5748aa5d45af47fc9909310b', (err, user) => {
  user.delete(() => {
    // do something
  });
});
```

## TODO
  - Mongo
    - Advanced wheres
    - Agregates
    - Joins
  - Mysql(maybe later)
