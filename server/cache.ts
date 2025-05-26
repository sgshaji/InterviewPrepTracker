import { createClient } from 'redis';

class CacheService {
  private client: any;
  private isConnected = false;

  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err: any) => {
        console.log('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.log('Redis connection failed, continuing without cache:', error);
      this.isConnected = false;
    }
  }

  async get(key: string) {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.log('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    if (!this.isConnected) return;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.log('Cache set error:', error);
    }
  }

  async del(key: string) {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.log('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string) {
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.log('Cache invalidation error:', error);
    }
  }

  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

export const cache = new CacheService();