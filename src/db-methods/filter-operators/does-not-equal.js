import { defer } from "../../async-utils";

const LOWEST_CHAR = String.fromCharCode(0);
const HIGHEST_CHAR = String.fromCharCode(65535);
const LOWEST_NUM = -Infinity;
const HIGHEST_NUM = Infinity;

export function doesNotEqual(db, storeName, key) {
  return function (value) {
    // maybe add support for other valid values?
    // boolean, number, string, date, object, array, regexp, undefined and null

    if (!(typeof value === "string" || typeof value === "number")) {
      throw new Error(
        "`.contains()` currently only works with string and number indexes"
      );
    }
    const {
      promise: lowerPromise,
      resolve: lowerResolve,
      reject: lowerReject,
    } = defer("lower");
    const {
      promise: upperPromise,
      resolve: upperResolve,
      reject: upperReject,
    } = defer("upper");

    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const index = store.index(key);

    const lowerRange = IDBKeyRange.bound(
      typeof value === "number" ? LOWEST_NUM : LOWEST_CHAR,
      value,
      false,
      true
    );

    const results = [];
    const lowerRequest = index.openCursor(lowerRange);
    lowerRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        lowerResolve(results);
      }
    };

    lowerRequest.onerror = function (event) {
      console.error(`where not equals to ${storeName} error`, event);
      lowerReject(event);
    };

    const upperRange = IDBKeyRange.bound(
      value,
      typeof value === "number" ? HIGHEST_NUM : HIGHEST_CHAR,
      true,
      false
    );
    const upperRequest = index.openCursor(upperRange);
    upperRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        upperResolve(results);
      }
    };

    upperRequest.onerror = function (event) {
      console.error(`where not equals to ${storeName} error`, event);
      upperReject(event);
    };

    return Promise.all([lowerPromise, upperPromise]).then(([r1, r2]) =>
      r1.concat(r2)
    );
  };
}
