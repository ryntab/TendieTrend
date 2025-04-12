// tasks/getLeaderboard.js

import { redis } from '../db/redis.js';

export async function getLeaderboard(guildId) {
    try {
        const pattern = `stats:${guildId}:*`;
        const keys = await scanKeys(pattern);
    
        const users = [];
        for (const key of keys) {
            const userId = key.split(':')[2];
            const stats = await redis.hgetall(key);
            users.push({
                userId,
                total_correct: parseInt(stats.total_correct || 0),
                current_streak: parseInt(stats.current_streak || 0),
                longest_streak: parseInt(stats.longest_streak || 0),
            });
        }
    
        const topAllTime = [...users].sort((a, b) => b.total_correct - a.total_correct).slice(0, 10);
        const topStreaks = [...users].sort((a, b) => b.current_streak - a.current_streak).slice(0, 10);
    
        console.log(`Leaderboard for ${guildId}:`);
        console.log('Top All Time:', topAllTime);
        console.log('Top Streaks:', topStreaks);
    
        return { topAllTime, topStreaks };
    } catch {
        console.error('❌ Error fetching leaderboard:', err);
        throw new Error('Failed to fetch leaderboard data');
    }
}

// Helper to scan Redis keys by pattern
async function scanKeys(pattern) {
    const keys = [];
    let cursor = '0';
    do {
        const reply = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = reply[0];
        keys.push(...reply[1]);
    } while (cursor !== '0');
    return keys;
}
