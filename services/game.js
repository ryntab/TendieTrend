import { EmbedBuilder } from 'discord.js';
import { proxyImage } from '../core/utils.js';

const userVotes = new Map(); // userId -> emoji
let votingOpen = true;

export const votes = userVotes;

export function closeVoting() {
  votingOpen = false;
}

export function openVoting() {
  votingOpen = true;
}

export function resetVotes() {
  userVotes.clear();
  votingOpen = true;
}

const marketOpenUtc = new Date();
marketOpenUtc.setUTCHours(13, 30, 0, 0); // 9:30AM ET = 13:30 UTC
if (marketOpenUtc < new Date()) marketOpenUtc.setUTCDate(marketOpenUtc.getUTCDate() + 1); // move to next day if past

const unixTimestamp = Math.floor(marketOpenUtc.getTime() / 1000); // convert to seconds
const relativeTime = `<t:${unixTimestamp}:R>`; // Discord will show "in 4 hours"

export async function sendMarketPoll(channel) {
    console.log(`📊 Sending market poll to ${channel.name}...`);
    const embed = new EmbedBuilder()
        .setTitle('📈 TendieTrend Market Prediction')
        .setDescription('Will the market close green or red tomorrow?\n\n🟢 Green\n🔴 Red\n\nReact to vote!')
        .setColor(0x5865F2)
        .setImage(proxyImage('https://img.freepik.com/free-vector/green-uptrend-market_1017-9640.jpg?semt=ais_hybrid&w=740'))
        .setFooter({ text: 'Poll closes at market open (9:30AM ET)' });

    const message = await channel.send({ embeds: [embed] });

    await message.react('🟢');
    await message.react('🔴');

    return message;
}

// Send at the end of the previous trading day.
export async function sendVotingOpenAlert(channel) {
    console.log(`📢 Sending premarket alert to ${channel.name}...`);
    let embed = new EmbedBuilder()
        .setTitle('📈 Voting is open!')
        .setDescription(`Be sure to cast your vote, the market opens soon. \n\n🕒 Voting ends <t:${unixTimestamp}:R>`)
        .setColor(0x5f5f5f)
        .setFooter({ text: 'Get ready!' });



    await channel.send({ embeds: [embed] });
}

// Send 30 minutes before market open.
export async function sendVotingClosingAlert(channel) {
    console.log(`📢 Sending premarket alert to ${channel.name}...`);
    const embed = new EmbedBuilder()
        .setTitle('📈 Cast your vote!')
        .setDescription(`Be sure to cast your vote, the market opens soon. \n\n🕒 Voting ends <t:${unixTimestamp}:R>`)
        .setColor(0xFFA500)
        .setFooter({ text: 'Get ready!' });

    await channel.send({ embeds: [embed] });
}

// Send at market open.
export async function sendMarketOpenAlert(channel) {
    console.log(`📢 Sending market open alert to ${channel.name}...`);
    const embed = new EmbedBuilder()
        .setTitle('🚀 Market Open!')
        .setDescription(`Will the market close green or red tomorrow?\n\n🟢 Green\n🔴 Red\n\nReact to vote!\n\n🕒 Voting ends <t:${unixTimestamp}:R>`)

        .setColor(0x00FF00)
        .setFooter({ text: `Voting ends ${relativeTime}` })

    await channel.send({ embeds: [embed] });
}

// Send at market close.
export async function sendMarketCloseAlert(channel) {
    console.log(`📢 Sending market close alert to ${channel.name}...`);
    const embed = new EmbedBuilder()
        .setTitle('⏰ Market Closed!')
        .setDescription('The market is now closed! Winners will be announced tomorrow!')
        .setColor(0xFF0000)
        .setFooter({ text: 'See you tomorrow!' });

    await channel.send({ embeds: [embed] });
}

export async function handleVote(reaction, user) {
    if (user.bot) return;

    const emoji = reaction.emoji.name;

    // Remove any non-voting emoji
    if (!['🟢', '🔴'].includes(emoji)) {
        try {
            await reaction.users.remove(user.id);
            console.log(`❌ Removed invalid emoji from ${user.tag}: ${emoji}`);
        } catch (err) {
            console.error('Failed to remove invalid emoji:', err);
        }
        return;
    }

    if (!votingOpen) {
        try {
            await reaction.users.remove(user.id);
            console.log(`⏰ Removed vote from ${user.tag} - voting is closed.`);
        } catch (err) {
            console.error('Failed to remove reaction:', err);
        }
        return;
    }

    // Only allow one vote: remove other if exists
    const previous = userVotes.get(user.id);
    if (previous && previous !== emoji) {
        const otherReaction = reaction.message.reactions.cache.get(previous);
        if (otherReaction) {
            otherReaction.users.remove(user.id).catch(() => { });
        }
    }

    userVotes.set(user.id, emoji);
    console.log(`✅ ${user.tag} voted ${emoji}`);
}
