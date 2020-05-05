import { defer } from "../async-utils.js";

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
