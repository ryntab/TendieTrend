// services/evaluateVotes.js

import { getMarketDate } from '../core/state.js';
import { getMarketState } from '../services/market.js'; // or wherever getMarketState is defined
import { vote } from '../db/vote.js';
import { convertEmojiToValue } from '../core/utils.js';
import { userStats } from '../db/stats.js';

export async function evaluateVotesForGuild(guildId) {
  try {
    const marketState = await getMarketState();
    if (!marketState) throw new Error('Market data unavailable');

    const actualDirection = marketState.direction; // 'up' or 'down'
    const votesToday = await vote(guildId).all();

    if (!votesToday) throw new Error('No votes found for today');

    for (const [userId, emoji] of Object.entries(votesToday)) {
        console.log(`Evaluating vote: guildId=${guildId}, userId=${userId}, emoji=${emoji}`);
        const prediction = convertEmojiToValue(emoji); // 'up' or 'down'
        const didWin = prediction === actualDirection;
      
        const stats = userStats(guildId, userId);
        if (didWin) await stats.incrementCorrect();
        await stats.updateStreak(didWin);
      }

    console.log(`✅ Finished evaluating votes for ${guildId}. Direction: ${actualDirection}`);
  } catch (err) {
    console.error(`❌ Failed to evaluate votes for ${guildId}:`, err.message);
  }
}