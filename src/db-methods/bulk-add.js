import { defer } from "../async-utils.js";

function bulkAdd(db, storeName) {
  return async function (elements) {
    const { promise, resolve, reject } = defer("bulk-add");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const succeeded = [];
    const failed = [];
    elements.forEach(function (element) {
      const request = store.add(element);
      request.onsuccess = function (event) {
        succeeded.push(event.target.result);
      };
      request.onerror = function (event) {
        failed.push(event.target.result);
      };
    });

    transaction.oncomplete = function (event) {
      resolve({ succeeded, failed });
    };

    return promise;
  };
}

export default (db, name, element) => bulkAdd(db._db, name)(element);
