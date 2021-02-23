export type TypeGuard<T> = (arg: unknown) => arg is T;
type Rest<T extends any[]> = T extends [any, ...infer R] ? R : any;
type First<T extends any[]> = T extends [infer R, ...any[]] ? R : any;
type TypeGuardReturnType<T extends (src: unknown) => src is any> = T extends (src: unknown) => src is infer R ? R : any;
type UnionTypeGuardReturnType<T extends TypeGuard<any>[]> = TypeGuardReturnType<First<T>> | (T extends [any] ? never : UnionTypeGuardReturnType<Rest<T>>);
type TupleReturnType<T extends TypeGuard<any>[]> = {
  [K in keyof T]: T[K] extends TypeGuard<infer T> ? T : never
};

/**
 * Narrows `val` to include the property `key` (if true is returned)
 * @param val The object to be tested
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any type meaningful)
 */
export function hasOwnProperty<S extends object, K extends PropertyKey>(val: S, key: K): val is (S & { [key in K]: unknown }) {
  // this call syntax is for when `val` was created by `Object.create(null)`
  return Object.prototype.hasOwnProperty.call(val, key);
}

/**
 * Narrows `val` to a static type that includes fields of names in `keys`
 * @param val the value that we are trying to type narrow
 * @param keys the key names (must be literals for tsc to do any type meaningful)
 */
export function hasOwnProperties<S extends object, K extends PropertyKey>(val: S, ...keys: K[]): val is (S & { [key in K]: unknown }) {
  return keys.every(key => hasOwnProperty(val, key));
}

/**
 * Narrows `val` to include the property `key` with type `V`
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any type meaningful)
 * @param isValid a function to check if the field is valid
 */
export function hasTypedProperty<S extends object, K extends PropertyKey, V>(val: S, key: K, isValid: (value: unknown) => value is V): val is (S & { [key in K]: V }) {
  return hasOwnProperty(val, key) && isValid(val[key]);
}

/**
 * Narrows `val` to include the property `key` with type `V | undefined` or doesn't contain it
 * @param val the value that we are trying to type narrow
 * @param key The key to test if it is present on the object (must be a literal for tsc to do any type meaningful)
 * @param isValid a function to check if the field (when present) is valid
 */
export function hasOptionalProperty<S extends object, K extends PropertyKey, V>(val: S, key: K, isValid: (value: unknown) => value is V): val is (S & { [key in K]?: V }) {
  if (hasOwnProperty(val, key)) {
    return typeof val[key] === "undefined" || isValid(val[key]);
  }

  return true;
}

/**
 * isRecord checks if `val` matches the signature `Record<T, V>` or `{ [label in T]: V }`
 * @param val The value to be checked
 * @param isKey a function for checking if the key is of the correct type
 * @param isValue a function for checking if a value is of the correct type
 */
export function isRecord<T extends PropertyKey, V>(val: unknown, isKey: (key: unknown) => key is T, isValue: (value: unknown) => value is V): val is Record<T, V> {
  return isObject(val) && Object.entries(val).every(([key, value]) => isKey(key) && isValue(value));
}

/**
 * isTypedArray checks if `val` is an array and all of its entries are of type `T`
 * @param val The value to be checked
 * @param isEntry a function for checking if an entry is the correct type
 */
export function isTypedArray<T>(val: unknown, isEntry: (entry: unknown) => entry is T): val is T[] {
  return Array.isArray(val) && val.every(isEntry);
}

/**
 * checks to see if `src` is a tuple with elements matching each of the type guards
 * @param src The value to be checked
 * @param typeguards the list of type-guards to check each element
 */
export function isTuple<T extends TypeGuard<any>[]>(src: unknown, ...typeguards: T): src is TupleReturnType<T> {
  return Array.isArray(src)
    && (src.length <= typeguards.length)
    && typeguards.every((typeguard, i) => typeguard(src[i]));
}

/**
 * checks if val is of type string
 * @param val the value to be checked
 */
export function isString(val: unknown): val is string {
  return typeof val === "string";
}

/**
 * checks if val is of type boolean
 * @param val the value to be checked
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === "boolean";
}

/**
 * checks if val is of type number
 * @param val the value to be checked
 */
export function isNumber(val: unknown): val is number {
  return typeof val === "number";
}

/**
 * checks if val is of type object and isn't null
 * @param val the value to be checked
 */
export function isObject(val: unknown): val is object {
  return typeof val === "object" && val !== null;
}

/**
 * checks if val is null
 * @param val the value to be checked
 */
export function isNull(val: unknown): val is null {
  return val === null;
}

/**
 * Creates a new type-guard function (with the same predicate) from `fn`. Such
 * that it can be called with just the value to be tested.
 *
 * This is useful for when using `hasOptionalProperty` and `hasTypedProperty`
 * @param fn A typescript user predicate function to be bound
 * @param boundArgs the set of arguments to be passed to `fn` in the new function
 *
 * Example:
 * ```
 * bindTypeGuard(isTypedArray, isString); // Predicate<string[]>
 * bindTypeGuard(isRecord, isString, isBoolean); // Predicate<Record<string, boolean>>
 * bindTypeGuard(isTuple, isString, isBoolean); // Predicate<[string, boolean]>
 *
 * Note: this function does not currently nest as a direct argument to itself.
 * It needs to be extracted to a variable for typescript's type checker to work.
 * ```
 */
export function bindTypeGuard<FnArgs extends any[], T>(fn: (arg1: unknown, ...args: FnArgs) => arg1 is T, ...boundArgs: FnArgs): TypeGuard<T> {
  return (arg1: unknown): arg1 is T => fn(arg1, ...boundArgs);
}

/**
 * Create a new type-guard for the union of the types that each of the
 * predicates are type-guarding for
 * @param typeGuards a list of predicates that should be executed in order
 *
 * Example:
 * ```
 * createUnionGuard(isString, isBoolean); // Predicate<string | boolean>
 * ```
 */
export function unionTypeGuard<TypeGuards extends TypeGuard<any>[]>(...typeGuards: TypeGuards): TypeGuard<UnionTypeGuardReturnType<TypeGuards>> {
  return (arg: unknown): arg is UnionTypeGuardReturnType<TypeGuards> => {
    return typeGuards.some(typeguard => typeguard(arg));
  };
}