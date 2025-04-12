import { redis } from '../db/redis.js';
import { vote } from '../db/vote.js';
import { userStats } from '../db/stats.js';
import { getMarketDate } from '../core/state.js';

const guildId = 'test-guild';
const date = getMarketDate();

console.log(`🌱 Seeding test data for guild: ${guildId}, date: ${date}`);

for (let i = 1; i <= 100; i++) {
  const userId = `user${i}`;

  // Alternate votes 🟢 and 🔴
  const emoji = i % 2 === 0 ? '🟢' : '🔴';
  await vote(guildId, userId).set(emoji);

  // Random stats
  const stats = userStats(guildId, userId);
  const correct = Math.floor(Math.random() * 10);
  const streak = Math.floor(Math.random() * 6);
  const longest = Math.max(streak, Math.floor(Math.random() * 12));

  await redis.hset(`stats:${guildId}:${userId}`, {
    total_correct: correct,
    current_streak: streak,
    longest_streak: longest,
  });
}

console.log('✅ Test data seeded.');
process.exit();
