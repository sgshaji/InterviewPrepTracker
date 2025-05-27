import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

async function testRedisConnection() {
  try {
    console.log('Testing Redis connection...');
    console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✅ Present' : '❌ Missing');
    console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Present' : '❌ Missing');

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test connection
    await redis.ping();
    console.log('✅ Redis connection successful!');

    // Test set and get
    const testKey = 'test:connection';
    const testValue = 'Hello Redis!';
    
    await redis.set(testKey, testValue);
    const retrievedValue = await redis.get(testKey);
    
    if (retrievedValue === testValue) {
      console.log('✅ Redis set/get test successful!');
    } else {
      throw new Error('Redis set/get test failed');
    }

    // Cleanup
    await redis.del(testKey);
    console.log('✅ Redis cleanup successful!');
  } catch (error) {
    console.error('❌ Redis test failed:', error);
  }
}

testRedisConnection(); 