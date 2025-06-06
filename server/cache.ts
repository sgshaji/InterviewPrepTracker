import { Redis } from '@upstash/redis';

class CacheService {
  private redis: Redis;
  private isConnected = false;

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis configuration is missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }

    // Clean the URL by removing any extra quotes
    const cleanUrl = process.env.UPSTASH_REDIS_REST_URL.replace(/^["']|["']$/g, '');
    const cleanToken = process.env.UPSTASH_REDIS_REST_TOKEN.replace(/^["']|["']$/g, '');

    this.redis = new Redis({
      url: cleanUrl,
      token: cleanToken,
    });
  }

  async connect() {
    try {
      await this.redis.ping();
      this.isConnected = true;
      console.log('✅ Connected to Upstash Redis');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async get(key: string) {
    if (!this.isConnected) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    if (!this.isConnected) return;
    try {
      await this.redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string) {
    if (!this.isConnected) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async invalidatePattern(pattern: string) {
    if (!this.isConnected) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
    }
  }

  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}

export const cache = new CacheService();