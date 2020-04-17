import { equals, doesNotEqual } from "./filter-operators/equals";

export function where(db, storeName) {
  return function (key) {
    return {
      equals: equals(db, storeName, key),
      not: {
        equals: () => new Promise((r) => r("not implemented yet")), // doesNotEqual(db, storeName, key),
      },
      contains: () => new Promise((r) => r("not implemented yet")),
    };
  };
}
