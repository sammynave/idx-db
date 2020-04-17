# Api

```js
import { openDb } from "db";

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
const { todos } = db.stores;

await todos.add(todo); // Todo
await todos.delete(id); // DeletedTodo
await todos.update(todo); // Todo
await todos.find(id); // Todo
await todos.all(); // [Todo]
await todos.where("title").equals("hello", { ignoreCase: true }); // [Todo]
await todos.where("title").contains("hello"); // [Todo]
await todos.where("title").not.equals("hello"); // [Todo
await todos.where("done").equals(false); // [Todo]
```