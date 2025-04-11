import { client } from './core/client.js';
import { registerCommands } from './commands/slash.js';
import { sendMarketPoll, sendVotingOpenAlert, sendVotingClosingAlert, sendMarketCloseAlert, sendMarketOpenAlert, handleVote } from './services/game.js';

client.once('ready', async () => {
  try {
    await registerCommands();
    const channel = await client.channels.fetch('1360149350545883228');
    // await sendPremarketAlert(channel);
    // await sendMarketPoll(channel);
    // await sendOpenAlert(channel);
    // await sendCloseAlert(channel);
    await sendVotingOpenAlert(channel);
    await sendVotingClosingAlert(channel);
    await sendMarketOpenAlert(channel);
    await sendMarketCloseAlert(channel);
  } catch (err) {
    console.error('❌ Error during startup:', err);
    process.exit(1);
  } finally {
    console.log('✅ Bot is ready...');
  }
});

client.on('messageCreate', async msg => {
  if (msg.content === '!poll' && msg.member.permissions.has('ManageGuild')) {
    await sendMarketPoll(msg.channel);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();
  if (user.partial) await user.fetch();
  handleVote(reaction, user);
});