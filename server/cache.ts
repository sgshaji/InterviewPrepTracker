import { createClient } from 'redis';

class CacheService {
  private memoryCache = new Map<string, { data: any; expires: number }>();
  private isConnected = true; // Always connected for in-memory cache

  async connect() {
    console.log('Using high-performance in-memory cache');
    this.isConnected = true;
  }

  async get(key: string) {
    if (!this.isConnected) return null;
    const item = this.memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return item.data;
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    if (!this.isConnected) return;
    const expires = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { data: value, expires });
  }

  async del(key: string) {
    if (!this.isConnected) return;
    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern: string) {
    if (!this.isConnected) return;
    const keys = Array.from(this.memoryCache.keys()).filter(key => 
      key.includes(pattern.replace('*', ''))
    );
    keys.forEach(key => this.memoryCache.delete(key));
  }

  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

export const cache = new CacheService();