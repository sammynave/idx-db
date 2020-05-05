import {
  openDb,
  add,
  update,
  all,
  destroy,
  find,
  whereEquals,
  whereNotEquals,
  whereContains,
  count,
  bulkAdd,
} from "../../src/index";

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
  await indexedDB.deleteDatabase("appDb");
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

  const todo = await add(db, "todos", { title: "first", done: false });
  console.log("add", todo);
  const newTodo = await update(db, "todos", { ...todo, done: !todo.done });
  console.log("update", newTodo);

  const destroyed = await destroy(db, "todos", newTodo);
  console.log("destroy", destroyed);

  const todo2 = await add(db, "todos", { title: "second", done: false });
  console.log("add", todo2);

  const allTodos = await all(db, "todos");
  console.log("all", allTodos);

  const [last] = allTodos.slice(-1);
  const found = await find(db, "todos", last.id);
  console.log("last", last);
  console.log("find", found);

  const todo3 = await add(db, "todos", { title: "same name", done: false });
  console.log("add", todo3);
  const todo4 = await add(db, "todos", { title: "same name", done: false });
  console.log("add", todo4);
  const whereTodos = await whereEquals(db, "todos", "title", "same name");
  console.log("where.equals", whereTodos);

  let ct = 0;
  let items = [];
  while (ct < 10000) {
    items.push({ title: "num", done: false, number: ct });
    ct++;
  }

  const t1 = performance.now();
  const bulkAdd1 = await bulkAdd(db, "todos", items);
  const t2 = performance.now();
  console.log(`bulk add 10000 - ${t2 - t1}ms`);
  console.log("bulkAdd", bulkAdd1);

  await add(db, "todos", { title: "num", done: false, number: 0 });
  await add(db, "todos", { title: "num", done: false, number: 1 });
  await add(db, "todos", { title: "num", done: false, number: 2 });

  const whereNotTodos = await whereNotEquals(db, "todos", "title", "same name");
  console.log("where.not.equals string", whereNotTodos);

  const whereNotTodosNum = await whereNotEquals(db, "todos", "number", 1);
  console.log("where.not.equals number", whereNotTodosNum);

  // Try with bad query type
  try {
    await whereNotEquals(db, "todos", "number", { id: "hi" });
  } catch (e) {
    console.log("successfully threw error", e);
  }

  const containsTodos = await whereContains(db, "todos", "title", "m");
  console.log("contains", containsTodos);

  try {
    const containsTodosError = await whereContains("number", 1);
  } catch (e) {
    console.log("successfuly threw error", e);
  }
  const countResults = await count(db, "todos");
  console.log("count", countResults);
}

init();
