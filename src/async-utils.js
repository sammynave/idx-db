/*
 * taken from github.com/tildeio/rsvp.js
 * usage:
 * async function doSomething(){
 *  const { promise, resolve, reject } = deferred(`add-to-${storeName}`)
 *  const request = someWeirdAsyncThirdPartyLib();
 *  request.onsuccess((result) => resolve(result))
 *  request.onsuccess((result) => reject(result))
 *  return promise;
 * }
 */
export function defer(label) {
  const deferred = { resolve: undefined, reject: undefined };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  }, label);

  return deferred;
}
