/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Flattens an object from `{a: {b: {c: 'd'}}}` to `{'a.b.c': 'd'}`
 *
 * @export
 * @param object the object to flatten
 * @param [number] how deep you want to flatten. 1 for flattening only the first nested prop, and keeping deeper objects as is.
 * @returns the flattened object
 */
export function flatten(object: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  return retrievePaths(object, null, result);
}

function retrievePaths(
  object: any,
  path: string | null,
  result: Record<string, any>
): Record<string, any> {
  if (typeof object !== 'object' || object === null) {
    if (path !== null) {
      result[path] = object;
    }
    return result;
  }
  return Object.keys(object).reduce((carry, key) => {
    const pathUntilNow = path ? path + '.' : '';
    const newPath = pathUntilNow + key;
    retrievePaths(object[key], newPath, carry);
    return carry;
  }, result);
}