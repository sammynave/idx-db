# Api

```js
import { openDb, add, count, destroy, update, find, all, whereEquals, whereNotEquals, whereContains } from "db";

const structure = [
  {
    version: 1,
    migration(db) {
      // could this have a nicer API?
      const store = db.createObjectStore("todos", {
        keyPath: "id",
        autoIncrement: true,
      });

      store.createIndex("title", "title", { unique: false });
    },
  },
  {
    version: 2,
    migration(db) {
      const store = db.createObjectStore("todos", {
        keyPath: "id",
        autoIncrement: true,
      });

      store.createIndex("done", "done", { unique: false });
    },
  },
];

const db = await openDb("db-name", structure);

// new api. thought this would be better for tree-shaking 🤷‍♂️ need to test it.
//       (db, storeName, arg)
await add(db, 'todos', todo); // Todo
await count(db, 'todos'); // Number
await destroy(db, 'todos', todo); // DeletedTodo
await update(db, 'todos', todo); // Todo
await find(db, 'todos', id); // Todo
await all(db, 'todos'); // [Todo]
await whereEquals(db, 'todos', "title", "hello"); // [Todo]
// should this be added as an arg to whereEquals({ ignoreCase: true }) and others?
await whereContains(db, 'todos', "title", "hello"); // [Todo]
await whereNotEquals(db, 'todos', "title", "hello"); // [Todo

// Pre 0.0.7 mabye?
//const { todos } = db.stores;
//
//await todos.add(todo); // Todo
//await todos.count(); // Number
//await todos.destroy(id); // DeletedTodo
//await todos.update(todo); // Todo
//await todos.find(id); // Todo
//await todos.all(); // [Todo]
//await todos.where("title").equals("hello", { ignoreCase: true }); // [Todo]
//await todos.where("title").contains("hello"); // [Todo]
//await todos.where("title").not.equals("hello"); // [Todo
//await todos.where("done").equals(false); // [Todo]
```