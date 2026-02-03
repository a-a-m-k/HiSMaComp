/**
 * LRU (Least Recently Used) Cache Implementation
 *
 * A cache that evicts the least recently used items when the size limit is reached.
 * This provides better cache hit rates compared to FIFO eviction.
 */
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

  /**
   * Get a value from the cache.
   * Updates the access order (moves to end = most recently used).
   *
   * @param key - The cache key
   * @returns The cached value or undefined if not found
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  /**
   * Set a value in the cache.
   * If the cache is full, evicts the least recently used item.
   *
   * @param key - The cache key
   * @param value - The value to cache
   */
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

  /**
   * Check if a key exists in the cache without updating access order.
   *
   * @param key - The cache key
   * @returns True if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a value from the cache.
   *
   * @param key - The cache key
   * @returns True if key was deleted
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache.
   *
   * @returns Number of entries in cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get the maximum size of the cache.
   *
   * @returns Maximum number of entries
   */
  get maxCacheSize(): number {
    return this.maxSize;
  }

  /**
   * Get cache statistics.
   *
   * @returns Object with cache statistics
   */
  getStats() {
    return {
      size: this.size,
      maxSize: this.maxSize,
      utilization: (this.size / this.maxSize) * 100,
    };
  }
}
