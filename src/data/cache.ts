/**
 * In-memory caching layer for frequently accessed tide pool
 * survey data. Provides TTL-based expiration and LRU eviction
 * to keep memory usage bounded during long monitoring sessions.
 */

export interface CacheEntry<T> {
  readonly key: string;
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheConfig {
  readonly maxSize: number;
  readonly defaultTtlMs: number;
  readonly evictionPolicy: "lru" | "fifo" | "lfu";
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 500,
  defaultTtlMs: 300000,
  evictionPolicy: "lru",
};

export class DataCache<T> {
  private entries: Map<string, CacheEntry<T>> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.entries.size >= this.config.maxSize && !this.entries.has(key)) {
      this.evict();
    }
    const ttl = ttlMs ?? this.config.defaultTtlMs;
    this.entries.set(key, {
      key,
      value,
      expiresAt: Date.now() + ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  size(): number {
    return this.entries.size;
  }

  keys(): string[] {
    this.pruneExpired();
    return Array.from(this.entries.keys());
  }

  private evict(): void {
    if (this.entries.size === 0) return;

    this.pruneExpired();
    if (this.entries.size < this.config.maxSize) return;

    let victimKey: string | null = null;
    let victimScore = Infinity;

    for (const [key, entry] of this.entries) {
      let score: number;
      switch (this.config.evictionPolicy) {
        case "lru":
          score = entry.lastAccessed;
          break;
        case "lfu":
          score = entry.accessCount;
          break;
        case "fifo":
          score = entry.expiresAt - (this.config.defaultTtlMs);
          break;
      }
      if (score < victimScore) {
        victimScore = score;
        victimKey = key;
      }
    }

    if (victimKey) {
      this.entries.delete(victimKey);
    }
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (now > entry.expiresAt) {
        this.entries.delete(key);
      }
    }
  }

  stats(): { size: number; hitRate: number } {
    const totalAccesses = Array.from(this.entries.values())
      .reduce((sum, e) => sum + e.accessCount, 0);
    return {
      size: this.entries.size,
      hitRate: this.entries.size > 0 ? totalAccesses / this.entries.size : 0,
    };
  }
}

export function createCache<T>(maxSize: number, ttlMs: number): DataCache<T> {
  return new DataCache<T>({ maxSize, defaultTtlMs: ttlMs, evictionPolicy: "lru" });
}
