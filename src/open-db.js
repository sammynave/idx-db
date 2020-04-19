import { findMaxKey, byIdAsc } from "./array-utils.js";
import { defer } from "./async-utils.js";

function wrap(db) {
  const storeNames = [...db.objectStoreNames];

  return { _db: db, stores: storeNames };
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
