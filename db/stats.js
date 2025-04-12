import { redis } from './redis.js';

export function userStats(guildId, userId) {
  if (!guildId || !userId) throw new Error('guildId and userId are required');
  const key = `stats:${guildId}:${userId}`;

  return {
    async incrementCorrect() {
      return redis.hincrby(key, 'total_correct', 1);
    },

    async updateStreak(didWin) {
      if (didWin) {
        const newStreak = await redis.hincrby(key, 'current_streak', 1);
        const longest = parseInt(await redis.hget(key, 'longest_streak')) || 0;
        if (newStreak > longest) {
          await redis.hset(key, 'longest_streak', newStreak);
        }
      } else {
        await redis.hset(key, 'current_streak', 0);
      }
    },

    async get() {
      return redis.hgetall(key);
    },

    async reset() {
      return redis.del(key);
    },

    async getFormatted() {
      const raw = await redis.hgetall(key);
      return {
        total_correct: Number(raw.total_correct || 0),
        current_streak: Number(raw.current_streak || 0),
        longest_streak: Number(raw.longest_streak || 0),
      };
    }
  };
}
