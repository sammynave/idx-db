/*
 * taken from github.com/tildeio/rsvp.js
 * usage:
 * async function doSomething(){
 *  const { promise, resolve, reject } = deferred(`add-to-${storeName}`)
 *  const request = someWeirdAsyncThirdPartyLib();
 *  request.onsuccess((result) => resolve(result))
 *  request.onsuccess((result) => reject(result))
 *  return promise;
 * }
 */
function defer(label) {
  const deferred = { resolve: undefined, reject: undefined };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  }, label);

  return deferred;
}

function all(db, storeName) {
  return async function (element) {
    const { promise, resolve, reject } = defer("all");
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = function (event) {
      const elements = event.target.result;
      resolve(elements);
    };

    request.onerror = function (event) {
      console.error(`all to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function add(db, storeName) {
  return async function (element) {
    const { promise, resolve, reject } = defer("add");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.add(element);

    request.onsuccess = function (event) {
      const id = event.target.result;
      resolve({ ...element, id });
    };

    request.onerror = function (event) {
      console.error(`add to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function destroy(db, storeName) {
  // add support for bulk destroy?
  // element or [element]
  // maybe .where('title').contains('butt').destroy()
  return async function (element) {
    const { promise, resolve, reject } = defer("destroy");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(element.id);

    request.onsuccess = function (event) {
      resolve(element);
    };

    request.onerror = function (event) {
      console.error(`destroy ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function update(db, storeName) {
  return async function (element) {
    const { promise, resolve, reject } = defer("update");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(element);

    request.onsuccess = function (event) {
      resolve(element);
    };

    request.onerror = function (event) {
      console.error(`update to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function find(db, storeName) {
  return async function (id) {
    const { promise, resolve, reject } = defer("find");
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = function (event) {
      const element = event.target.result;
      resolve(element);
    };

    request.onerror = function (event) {
      console.error(`find to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function count(db, storeName) {
  return async function (id) {
    const { promise, resolve, reject } = defer("count");
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onsuccess = function (event) {
      const count = event.target.result;
      resolve(count);
    };

    request.onerror = function (event) {
      console.error(`count to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function equals(db, storeName, key) {
  return function (value) {
    const { promise, resolve, reject } = defer("find");
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(key);
    const range = IDBKeyRange.only(value);

    const results = [];
    const request = index.openCursor(range);
    request.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = function (event) {
      console.error(`where equals to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

const LOWEST_CHAR = String.fromCharCode(0);
const HIGHEST_CHAR = String.fromCharCode(65535);
const LOWEST_NUM = -Infinity;
const HIGHEST_NUM = Infinity;

function doesNotEqual(db, storeName, key) {
  return function (value) {
    // maybe add support for other valid values?
    // boolean, number, string, date, object, array, regexp, undefined and null

    if (!(typeof value === "string" || typeof value === "number")) {
      throw new Error(
        "`.contains()` currently only works with string and number indexes"
      );
    }
    const {
      promise: lowerPromise,
      resolve: lowerResolve,
      reject: lowerReject,
    } = defer("lower");
    const {
      promise: upperPromise,
      resolve: upperResolve,
      reject: upperReject,
    } = defer("upper");

    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(key);

    const lowerRange = IDBKeyRange.bound(
      typeof value === "number" ? LOWEST_NUM : LOWEST_CHAR,
      value,
      false,
      true
    );

    const results = [];
    const lowerRequest = index.openCursor(lowerRange);
    lowerRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        lowerResolve(results);
      }
    };

    lowerRequest.onerror = function (event) {
      console.error(`where not equals to ${storeName} error`, event);
      lowerReject(event);
    };

    const upperRange = IDBKeyRange.bound(
      value,
      typeof value === "number" ? HIGHEST_NUM : HIGHEST_CHAR,
      true,
      false
    );
    const upperRequest = index.openCursor(upperRange);
    upperRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        upperResolve(results);
      }
    };

    upperRequest.onerror = function (event) {
      console.error(`where not equals to ${storeName} error`, event);
      upperReject(event);
    };

    return Promise.all([lowerPromise, upperPromise]).then(([r1, r2]) =>
      r1.concat(r2)
    );
  };
}

// supports strings only
function contains(db, storeName, key) {
  return function (value) {
    if (typeof value !== "string") {
      throw new Error("`.contains` currently only works with strings");
    }
    const { promise, resolve, reject } = defer("find");
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(key);

    const results = [];
    const request = index.openCursor();

    request.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        if (cursor.value[key].indexOf(value) !== -1) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = function (event) {
      console.error(`where equals to ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}

function findMaxKey({ key, arr }) {
  return Math.max(...arr.map((el) => el[key]));
}

const byIdAsc = (a, b) => a.id - b.id;

function wrap(db) {
  const storeNames = [...db.objectStoreNames];

  return { _db: db, stores: storeNames };
}

// openDb({ name: 'app', structure })
async function openDb({ name, structure, newVersionCallback }) {
  const { promise, resolve, reject } = defer("open-db");
  const currentVersion = findMaxKey({ arr: structure, key: "version" });
  const request = window.indexedDB.open(name, currentVersion);

  function useNewDatabase(db) {
    db.onversionchange = (event) => {
      db.close();
      /*
       * example callback might notify user that there's a new version
       * "A new version of this page is ready. Please reload or close this tab!"
       */
      newVersionCallback && newVersionCallback();
    };
  }

  request.onsuccess = (event) => {
    const db = event.target.result;
    useNewDatabase(db);
    resolve(wrap(db));
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const orderedStructure = structure.sort(byIdAsc);

    orderedStructure.forEach(({ version, migration }) => {
      if (event.oldVersion < version) {
        migration(event);
      }
    });

    useNewDatabase(db);
    db.onabort = (event) => {
      console.error(event.target.error);
    };
  };

  request.onerror = (event) => {
    reject({ event, request });
  };

  return promise;
}

const add$1 = (db, name, element) => add(db._db, name)(element);
const all$1 = (db, name, element) => all(db._db, name)(element);
const destroy$1 = (db, name, element) => destroy(db._db, name)(element);
const find$1 = (db, name, element) => find(db._db, name)(element);
const update$1 = (db, name, element) => update(db._db, name)(element);
const whereEquals = (db, name, key, element) =>
  equals(db._db, name, key)(element);
const whereNotEquals = (db, name, key, element) =>
  doesNotEqual(db._db, name, key)(element);
const whereContains = (db, name, key, element) =>
  contains(db._db, name, key)(element);
const count$1 = (db, name, element) => count(db._db, name)(element);

export { add$1 as add, all$1 as all, count$1 as count, destroy$1 as destroy, find$1 as find, openDb, update$1 as update, whereContains, whereEquals, whereNotEquals };
