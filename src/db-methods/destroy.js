import { defer } from "../async-utils.js";

export function destroy(db, storeName) {
  // add support for bulk destroy?
  // element or [element]
  // maybe .where('title').contains('butt').destroy()
  return async function (element) {
    const { promise, resolve, reject } = defer("destroy");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(element.id);

    request.onsuccess = function (event) {
      resolve(element);
    };

    request.onerror = function (event) {
      console.error(`destroy ${storeName} error`, event);
      reject(event);
    };

    return promise;
  };
}
