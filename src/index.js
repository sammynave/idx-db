import { defer } from "./async-utils";
import { findMaxKey, byIdAsc } from "./array-utils";
import { all } from "./db-methods/all";
import { add } from "./db-methods/add";
import { destroy } from "./db-methods/destroy";
import { update } from "./db-methods/update";
import { find } from "./db-methods/find";
import { where } from "./db-methods/where";

function wrap(db) {
  const storeNames = [...db.objectStoreNames];
  const stores = storeNames.reduce((methods, name) => {
    methods[name] = {
      add: add(db, name),
      all: all(db, name),
      destroy: destroy(db, name),
      find: find(db, name),
      update: update(db, name),
      where: where(db, name),
    };
    return methods;
  }, {});

  return { _db: db, stores };
}

function unwrap({ _db }) {
  return _db;
}

// openDb({ name: 'app', structure })
export async function openDb({ name, structure, newVersionCallback }) {
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
