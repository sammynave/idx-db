import { defer } from "../../async-utils.js";

export function equals(db, storeName, key) {
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
