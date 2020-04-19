import { all as _all } from "./db-methods/all.js";
import { add as _add } from "./db-methods/add.js";
import { destroy as _destroy } from "./db-methods/destroy.js";
import { update as _update } from "./db-methods/update.js";
import { find as _find } from "./db-methods/find.js";
import { count as _count } from "./db-methods/count.js";
import { equals } from "./db-methods/filter-operators/equals.js";
import { doesNotEqual } from "./db-methods/filter-operators/does-not-equal.js";
import { contains } from "./db-methods/filter-operators/contains.js";

export const add = (db, name, element) => _add(db._db, name)(element);
export const all = (db, name, element) => _all(db._db, name)(element);
export const destroy = (db, name, element) => _destroy(db._db, name)(element);
export const find = (db, name, element) => _find(db._db, name)(element);
export const update = (db, name, element) => _update(db._db, name)(element);
export const whereEquals = (db, name, key, element) =>
  equals(db._db, name, key)(element);
export const whereNotEquals = (db, name, key, element) =>
  doesNotEqual(db._db, name, key)(element);
export const whereContains = (db, name, key, element) =>
  contains(db._db, name, key)(element);
export const count = (db, name, element) => _count(db._db, name)(element);
export { openDb } from "./open-db";
