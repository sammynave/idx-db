import { openDb } from "../../src/index";

// could this have a nicer API?
const structure = [
  {
    version: 1,
    migration(event) {
      const db = event.target.result;
      const store = db.createObjectStore("todos", {
        keyPath: "id",
        autoIncrement: true,
      });

      store.createIndex("title", "title", { unique: false });
    },
  },
  {
    version: 2,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");

      store.createIndex("done", "done", { unique: false });
    },
  },
  {
    version: 3,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");

      store.createIndex("butt", "butt", { unique: false });
    },
  },
  {
    version: 4,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");

      store.createIndex("butty", "butty", { unique: false });
    },
  },
  {
    version: 5,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");

      store.createIndex("booty", "booty", { unique: false });
    },
  },
  {
    version: 6,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");

      store.createIndex("turd", "turd", { unique: false });
    },
  },
  {
    version: 7,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");

      store.createIndex("trd", "trd", { unique: false });
    },
  },
  {
    version: 8,
    migration(event) {
      const transaction = event.target.transaction;
      const store = transaction.objectStore("todos");
      // TODO how do you backfill?
      store.createIndex("number", "number", { unique: false });
    },
  },
];

async function init() {
  const db = await openDb({
    name: "appDb",
    structure,
    newVersionCallback: () => {
      window.location.reload();
    },
  });

  const hi = document.createElement("div");
  hi.textContent = db ? "db loaded!" : "db failed to load";
  document.body.append(hi);

  const todo = await db.stores.todos.add({ title: "first", done: false });
  console.log("add", todo);

  const newTodo = await db.stores.todos.update({ ...todo, done: !todo.done });
  console.log("update", newTodo);

  const destroyed = await db.stores.todos.destroy(newTodo);
  console.log("destroy", destroyed);

  const todo2 = await db.stores.todos.add({ title: "second", done: false });
  console.log("add", todo2);

  const allTodos = await db.stores.todos.all();
  console.log("all", allTodos);

  const [last] = allTodos.slice(-1);
  const found = await db.stores.todos.find(last.id);
  console.log("last", last);
  console.log("find", found);

  const todo3 = await db.stores.todos.add({ title: "same name", done: false });
  console.log("add", todo3);
  const todo4 = await db.stores.todos.add({ title: "same name", done: false });
  console.log("add", todo4);
  const whereTodos = await db.stores.todos.where("title").equals("same name");
  console.log("where.equals", whereTodos);

  await db.stores.todos.add({ title: "num", done: false, number: 0 });
  await db.stores.todos.add({ title: "num", done: false, number: 1 });
  await db.stores.todos.add({ title: "num", done: false, number: 2 });

  const whereNotTodos = await db.stores.todos
    .where("title")
    .not.equals("same name");
  console.log("where.not.equals string", whereNotTodos);

  const whereNotTodosNum = await db.stores.todos.where("number").not.equals(1);
  console.log("where.not.equals number", whereNotTodosNum);

  // Try with bad query type
  try {
    await db.stores.todos.where("number").not.equals({ id: "hi" });
  } catch (e) {
    console.log("successfully threw error", e);
  }

  const containsTodos = await db.stores.todos.where("title").contains("m");
  console.log("contains", containsTodos);

  try {
    const containsTodosError = await db.stores.todos
      .where("number")
      .contains(1);
  } catch (e) {
    console.log("successfuly threw error", e);
  }
  const count = await db.stores.todos.count();
  console.log("count", count);
}

init();
