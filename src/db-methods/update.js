import { defer } from "../async-utils";

export function update(db, storeName) {
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
