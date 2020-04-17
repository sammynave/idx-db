import { equals } from "./filter-operators/equals";
import { contains } from "./filter-operators/contains";

import { doesNotEqual } from "./filter-operators/does-not-equal";

export function where(db, storeName) {
  return function (key) {
    return {
      equals: equals(db, storeName, key),
      not: {
        equals: doesNotEqual(db, storeName, key),
      },
      contains: contains(db, storeName, key),
    };
  };
}
