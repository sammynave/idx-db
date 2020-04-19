import { defer } from "../async-utils.js";

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

export default (db, name, element) => all(db._db, name)(element);
