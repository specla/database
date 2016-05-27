# Specla database

This module is the database handler for the Specla Framework, its like Laravels
Eloquent but just for javascript and MongoDB.
> Please be aware that this is not in a state which is ready for release

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
Specla database includes to modules the `Query builder` and the `DB.Model`.

# Query builder


#### Fetch data
```js
DB.collection('users').get((err, result) => {
  // do something with the data
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
> Its important to notice that when youre using the raw method, you have to manually close the db connection with the `done` callback

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
User.find('5748aa5d45af47fc9909310b', (user) => {
  // do something with the user
});
```

#### Update
```js
User.find('5748aa5d45af47fc9909310b', (user) => {
  user.set('name', 'Frederik');
  user.save(() => {
    // do something
  });
});
```

#### delete
```js
User.find('5748aa5d45af47fc9909310b', (user) => {
  user.delete(() => {
    // do something
  });
});
```

## TODO
  - Schema validation
  - Mongo
    - Agregates
    - Joins
  - Mysql(maybe later)
