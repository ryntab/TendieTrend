import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not set');
}

export const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('🔌 Connected to Redis DB');
});

redis.on('error', (err) => {
    throw new Error(`❌ Redis connection error: ${err}`);
});

export function closeRedis() {
    redis.quit();
}
