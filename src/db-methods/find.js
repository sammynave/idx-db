import { defer } from "../async-utils";

export function find(db, storeName) {
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
