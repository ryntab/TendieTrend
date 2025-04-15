import * as redis from './db/redis.js';
import { client } from './core/client.js';
import { registerCommands } from './commands/slash.js';
import { getMarketState } from './services/market.js';
import { sendVotingOpenAlert, sendVotingClosingAlert, sendMarketCloseAlert, sendMarketOpenAlert, handleVote } from './services/game.js';
import { evaluateVotesForGuild } from './tasks/evaluateVotes.js';
import { getLeaderboard } from './tasks/getLeaderboard.js';

import GuildsDB from './db/guilds.js';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/:guildId/leaderboard', async (req, res) => {
  const guildId = req.params.guildId;
  const { topAllTime } = await getLeaderboard(guildId);

  res.render('leaderboard', { entries: topAllTime });
});

// ✅ Start server (set PORT env for Railway)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 HTTP server running on port ${PORT}`));




client.once('ready', async () => {
  try {
    // await registerCommands();
    // getLeaderboard('test-guild'); // Replace with actual guild ID
    //const channel = await client.channels.fetch('1360323357626863848');
    // await evaluateVotesForGuild('test-guild');
    //await sendVotingOpenAlert(channel);
    // await sendVotingClosingAlert(channel);
    // await sendMarketOpenAlert(channel);
    // await sendMarketCloseAlert(channel);
  } catch (err) {
    console.error('❌ Error during startup:', err);
    process.exit(1);
  } finally {
    console.log('✅ Bot is ready...');
  }
});

client.on('messageCreate', async msg => {
  if (msg.content === '!poll' && msg.member.permissions.has('ManageGuild')) {
    // await sendMarketPoll(msg.channel);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (user.partial) await user.fetch();

    await handleVote(reaction, user);
  } catch (err) {
    console.error('❌ Error handling reaction:', err);
  }
});

client.on('guildCreate', async (guild) => {
  try {
    await GuildsDB.markGuildAsManaged(guild);
  } catch (err) {
    console.error('❌ Error during guild creation:', err);
  }
});