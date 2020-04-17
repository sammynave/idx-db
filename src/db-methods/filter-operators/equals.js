import { defer } from "../../async-utils";

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

export function doesNotEqual(db, storeName, key) {
  return function (value) {
    const { promise, resolve, reject } = defer("find");
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(key);
    const getRequest = store.get();
    getRequest.onsuccess = function (event) {
      const first = event.target.result;
      const lastRequest = index.openCursor(null, "prev");
      lastRequest.onsuccess = function (event) {
        if (event.target.result) {
          const last = event.target.result.value; //the object with max revision
          const range = IDBKeyRange.bound(
            [firstResult[key], value],
            [value, last[key]],
            true,
            true
          );

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
            console.error(`where not equals to ${storeName} error`, event);
            reject(event);
          };
        }
      };

      lastRequest.onerror = function (event) {
        console.error(
          `where not equals (last result) to ${storeName} error`,
          event
        );
        reject(event);
      };
    };
    return promise;
  };
}
