import { defer } from "../../async-utils.js";

// supports strings only
export function contains(db, storeName, key) {
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
