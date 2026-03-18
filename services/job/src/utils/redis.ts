import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// Build Redis configuration object
const useTls = process.env.REDIS_USE_TLS === 'true';

const redisConfig: any = {
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
};

if (useTls) {
    redisConfig.socket.tls = true;
// Or: redisConfig.socket.tls = {};
}


// Only add username and password if they exist
if (process.env.REDIS_USERNAME) {
    redisConfig.username = process.env.REDIS_USERNAME;
}
if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
}

//console.log("Redis Config:", JSON.stringify(redisConfig, null, 2));

export const redis = createClient(redisConfig);

redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
redis.on('connect', () => console.log('🔄 Redis connecting...'));
redis.on('ready', () => console.log('✅ Redis ready'));

let initialized = false;

export const connectRedis = async (): Promise<void> => {
    if (!initialized && !redis.isOpen) {
        await redis.connect();
        initialized = true;
        console.log('✅ Redis connected successfully');
    }
};

export const disconnectRedis = async (): Promise<void> => {
    if (initialized) {
        await redis.quit();
        initialized = false;
        console.log('✅ Redis disconnected');
    }
};

export const CacheTTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 1800,          // 30 minutes
  VERY_LONG: 3600,     // 1 hour
  DAY: 86400,          // 24 hours
} as const;

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    if (!redis.isOpen) await connectRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    if (!redis.isOpen) await connectRedis();
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!redis.isOpen) await connectRedis();
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
};

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  try {
    if (!redis.isOpen) await connectRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys); 
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
};
