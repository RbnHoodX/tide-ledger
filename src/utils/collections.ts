/**
 * Collection utility functions for working with arrays,
 * maps, and sets of tide pool survey data. Provides
 * generic helpers for grouping, partitioning, and
 * transforming data collections.
 */

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const arr = groups.get(key) || [];
    arr.push(item);
    groups.set(key, arr);
  }
  return groups;
}

export function partition<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of items) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  return [pass, fail];
}

export function unique<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function flatten<T>(nested: T[][]): T[] {
  return nested.reduce((acc, arr) => acc.concat(arr), []);
}

export function sortBy<T>(items: T[], keyFn: (item: T) => number, desc: boolean = false): T[] {
  const sorted = [...items].sort((a, b) => keyFn(a) - keyFn(b));
  return desc ? sorted.reverse() : sorted;
}

export function indexBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T> {
  const index = new Map<string, T>();
  for (const item of items) {
    index.set(keyFn(item), item);
  }
  return index;
}

export function countBy<T>(items: T[], keyFn: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

export function topN<T>(items: T[], n: number, scoreFn: (item: T) => number): T[] {
  return sortBy(items, scoreFn, true).slice(0, n);
}

export function bottomN<T>(items: T[], n: number, scoreFn: (item: T) => number): T[] {
  return sortBy(items, scoreFn, false).slice(0, n);
}

export function zip<A, B>(as: A[], bs: B[]): [A, B][] {
  const len = Math.min(as.length, bs.length);
  const result: [A, B][] = [];
  for (let i = 0; i < len; i++) {
    result.push([as[i], bs[i]]);
  }
  return result;
}

export function mapValues<V, R>(
  map: Map<string, V>,
  fn: (value: V, key: string) => R
): Map<string, R> {
  const result = new Map<string, R>();
  for (const [key, value] of map) {
    result.set(key, fn(value, key));
  }
  return result;
}

export function filterMap<K, V>(
  map: Map<K, V>,
  predicate: (value: V, key: K) => boolean
): Map<K, V> {
  const result = new Map<K, V>();
  for (const [key, value] of map) {
    if (predicate(value, key)) {
      result.set(key, value);
    }
  }
  return result;
}

export function mergeMaps<K, V>(...maps: Map<K, V>[]): Map<K, V> {
  const result = new Map<K, V>();
  for (const m of maps) {
    for (const [k, v] of m) {
      result.set(k, v);
    }
  }
  return result;
}
