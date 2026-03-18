import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

// Build Redis configuration object
const useTls = process.env.REDIS_USE_TLS === 'true';

const redisConfig: any = {
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000), // Retry frequently with backoff
        connectTimeout: 5000, // 5 seconds timeout
    },
};

if (useTls) {
    redisConfig.socket.tls = true;
}

// Only add username and password if they exist
if (process.env.REDIS_USERNAME) {
    redisConfig.username = process.env.REDIS_USERNAME;
}
if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
}

export const redis = createClient(redisConfig);

redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
redis.on('connect', () => console.log('🔄 Redis connecting...'));
redis.on('ready', () => console.log('✅ Redis ready'));

let connectionPromise: Promise<void> | null = null;

export const connectRedis = async (): Promise<void> => {
    if (redis.isOpen) {
        return;
    }
    
    if (connectionPromise) {
        return connectionPromise;
    }

    console.log('🔌 Connecting to Redis...');
    connectionPromise = redis.connect()
        .then(() => {
            console.log('✅ Redis connected successfully');
        })
        .catch((error) => {
            console.error('❌ Redis connection failed:', error);
            connectionPromise = null; // Reset promise on failure
            throw error;
        });

    return connectionPromise;
};

export const disconnectRedis = async (): Promise<void> => {
    if (redis.isOpen) {
        await redis.quit();
        connectionPromise = null;
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
    if (!redis.isOpen) {
        // Race connection against a 2.5-second timeout
        await Promise.race([
            connectRedis(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2500))
        ]);
    }
    
    // Race get against a 2.5-second timeout
    const cached = await Promise.race([
        redis.get(key),
        new Promise<string|null>((_, reject) => setTimeout(() => reject(new Error('Redis get timeout')), 2500))
    ]);

    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    // Log warning but return null so the app continues using DB
    console.warn(`⚠️ Redis cache miss/error for ${key} (falling back to DB):`, error instanceof Error ? error.message : error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number): Promise<void> => {
  try {
    if (!redis.isOpen) {
        // Don't await connection for set - if not open, try to connect in background or skip
        connectRedis().catch(err => console.error('Background Redis connect failed:', err));
        if(!redis.isOpen) return; // Skip set if not connected immediately
    }
    
    // Set with timeout, don't block response too long
     await Promise.race([
        redis.setEx(key, ttl, JSON.stringify(value)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis set timeout')), 1000))
    ]);
  } catch (error) {
    console.warn(`⚠️ Redis set error for ${key}:`, error instanceof Error ? error.message : error);
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
      await redis.del(keys); // redis.del accepts string[] or varargs? Check interface.
      // v4 accepts array for del? (check docs/types).
      // actually, v4 client.del usually accepts string | string[].
    }
  } catch (error) {
    console.error(`Cache delete pattern error for ${pattern}:`, error);
  }
};
