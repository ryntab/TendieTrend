import { redis } from './redis.js';
import { getMarketDate } from '../core/time.js';
import { convertEmojiToValue, convertValueToEmoji } from '../core/utils.js';

export function vote(guildId, userId) {
  if (!guildId) throw new Error('guildId is required');

  const date = getMarketDate();
  const key = `votes:${guildId}:${date}`;

  return {
    async set(emoji) {
      if (!userId) throw new Error('userId is required for set()');
      const value = convertEmojiToValue(emoji);
      return redis.hset(key, userId, value);
    },

    async get() {
      if (!userId) throw new Error('userId is required for get()');
      const val = await redis.hget(key, userId);
      return convertValueToEmoji(val);
    },

    async delete() {
      if (!userId) throw new Error('userId is required for delete()');
      return redis.hdel(key, userId);
    },

    async all() {
      const raw = await redis.hgetall(key);
      const converted = {};
      for (const [userId, val] of Object.entries(raw)) {
        converted[userId] = convertValueToEmoji(val);
      }
      return converted;
    },

    async isFromActiveMessage(messageId) {
      const storedId = await redis.get(`active_vote_message:${guildId}`);
      return storedId === messageId;
    },
  };
}
