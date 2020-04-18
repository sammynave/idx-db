import { defer } from "../async-utils";

export function count(db, storeName) {
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
