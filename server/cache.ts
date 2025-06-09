import { Redis } from '@upstash/redis';

class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('⚠️  Redis configuration is missing. Cache will be disabled.');
      return;
    }

    try {
      // Clean the URL by removing any extra quotes
      const cleanUrl = process.env.UPSTASH_REDIS_REST_URL.replace(/^["']|["']$/g, '');
      const cleanToken = process.env.UPSTASH_REDIS_REST_TOKEN.replace(/^["']|["']$/g, '');

      this.redis = new Redis({
        url: cleanUrl,
        token: cleanToken,
      });
    } catch (error) {
      console.warn('⚠️  Failed to initialize Redis, cache will be disabled:', error);
      this.redis = null;
    }
  }

  async connect() {
    if (!this.redis) {
      console.log('⚠️  Redis is disabled, skipping connection');
      return;
    }

    try {
      await this.redis.ping();
      this.isConnected = true;
      console.log('✅ Connected to Upstash Redis');
    } catch (error) {
      console.warn('⚠️  Failed to connect to Redis, continuing without cache:', error);
      this.isConnected = false;
      this.redis = null;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300) {
    if (!this.isConnected || !this.redis) return;
    try {
      await this.redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string) {
    if (!this.isConnected || !this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async invalidatePattern(pattern: string) {
    if (!this.isConnected || !this.redis) return;
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}

export const cache = new CacheService();