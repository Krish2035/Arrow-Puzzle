import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let isConnected = false;

// Resilient In-Memory Fallback Cache with TTL
const memoryCache = new Map();

function cleanExpiredMemory() {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}
setInterval(cleanExpiredMemory, 60000).unref();

const redisUrl = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);

if (redisUrl || process.env.NODE_ENV === 'production') {
  try {
    redisClient = new Redis(redisUrl || 'redis://127.0.0.1:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 3) {
          // Stop retrying quickly to avoid log spam if Redis is not running
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true
    });

    redisClient.connect().then(() => {
      isConnected = true;
      console.log('✅ Connected to Redis cache service');
    }).catch((err) => {
      isConnected = false;
      console.warn('ℹ️ Redis unavailable (' + err.message + '). Seamlessly using in-memory cache fallback.');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
    });

    redisClient.on('connect', () => {
      isConnected = true;
    });
  } catch (err) {
    isConnected = false;
    console.warn('ℹ️ Redis initialization fallback: using resilient in-memory cache.');
  }
} else {
  console.log('ℹ️ Redis URL not set. Using resilient in-memory cache store.');
}

/**
 * Retrieve cached value by key
 */
export async function cacheGet(key) {
  if (isConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      // Fallback to memory
    }
  }

  const memItem = memoryCache.get(key);
  if (memItem) {
    if (!memItem.expiresAt || memItem.expiresAt > Date.now()) {
      return memItem.value;
    }
    memoryCache.delete(key);
  }
  return null;
}

/**
 * Store value in cache with TTL (default 300s = 5m)
 */
export async function cacheSet(key, value, ttlSeconds = 300) {
  if (isConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (e) {
      // Fallback to memory
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
  });
}

/**
 * Delete a specific key
 */
export async function cacheDel(key) {
  if (isConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (e) {}
  }
  memoryCache.delete(key);
}

/**
 * Delete keys matching a pattern
 */
export async function cacheDelPattern(pattern) {
  if (isConnected && redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (e) {}
  }

  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }
}

export function isRedisConnected() {
  return isConnected;
}

export { redisClient };
