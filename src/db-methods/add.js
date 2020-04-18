import { defer } from "../async-utils.js";

export function add(db, storeName) {
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
