import { defer } from "../async-utils.js";

// This could be a lot faster for columns that don't use auto generated keys
// with auto-incrementing ids bulkAdd 100,000 records ~ 23 seconds
// with externally managed ids bulkAdd 100,000 records ~ 13 seconds
function bulkAdd(db, storeName) {
  return async function (elements) {
    const { promise, resolve, reject } = defer("bulk-add");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const succeeded = [];
    const failed = [];

    const length = elements.length;
    let i = 0;
    while (i < length) {
      const request = store.add(elements[i]);
      request.onsuccess = function (event) {
        succeeded.push(event.target.result);
      };
      request.onerror = function (event) {
        failed.push(event.target.result);
      };
      i++;
    }

    transaction.oncomplete = function (event) {
      resolve({ succeeded, failed });
    };

    return promise;
  };
}

export default (db, name, element) => bulkAdd(db._db, name)(element);
