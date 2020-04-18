import { defer } from "./async-utils";
import { findMaxKey, byIdAsc } from "./array-utils";
import { all as _all } from "./db-methods/all";
import { add as _add } from "./db-methods/add";
import { destroy as _destroy } from "./db-methods/destroy";
import { update as _update } from "./db-methods/update";
import { find as _find } from "./db-methods/find";
import { count as _count } from "./db-methods/count";
import { equals } from "./db-methods/filter-operators/equals";
import { doesNotEqual } from "./db-methods/filter-operators/does-not-equal";
import { contains } from "./db-methods/filter-operators/contains";

function wrap(db) {
  const storeNames = [...db.objectStoreNames];

  return { _db: db, stores: storeNames };
}

export const add = (db, name, element) => _add(db._db, name)(element);
export const all = (db, name, element) => _all(db._db, name)(element);
export const destroy = (db, name, element) => _destroy(db._db, name)(element);
export const find = (db, name, element) => _find(db._db, name)(element);
export const update = (db, name, element) => _update(db._db, name)(element);
export const whereEquals = (db, name, key, element) =>
  equals(db._db, name, key)(element);
export const whereNotEquals = (db, name, key, element) =>
  doesNotEqual(db._db, name, key)(element);
export const whereContains = (db, name, key, element) =>
  contains(db._db, name, key)(element);
export const count = (db, name, element) => _count(db._db, name)(element);

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
