/** Evicts least recently used when full (better hit rate than FIFO). */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    if (maxSize <= 0) {
      throw new Error("Cache size must be greater than 0");
    }
    this.maxSize = maxSize;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) {
      return undefined;
    }

    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  get maxCacheSize(): number {
    return this.maxSize;
  }

  getStats() {
    return {
      size: this.size,
      maxSize: this.maxSize,
      utilization: (this.size / this.maxSize) * 100,
    };
  }
}
