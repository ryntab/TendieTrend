import { EmbedBuilder } from 'discord.js';
import { proxyImage } from '../core/utils.js';
import { getMarketOpenTime, getMarketDate } from '../core/time.js';
import { isVotingOpen } from '../core/state.js';
import { vote } from '../db/vote.js';
import { redis } from '../db/redis.js';

// Send at the end of the previous trading day.
export async function sendVotingOpenAlert(channel) {
    const guildId = channel.guildId;

    // Fetch the previous active message ID from Redis
    const prevMessageId = await redis.get(`active_vote_message:${guildId}`);

    if (prevMessageId) {
        try {
            const prevMessage = await channel.messages.fetch(prevMessageId);
            await prevMessage.delete();
            console.log(`🗑 Deleted old voting message for ${guildId}`);
        } catch (err) {
            console.warn(`⚠️ Could not delete previous vote message: ${err.message}`);
        }
    }

    const date = new Date(getMarketDate());
    const formatted = date.toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
    });
    const relativeTime = getMarketOpenTime(true);

    const embed = new EmbedBuilder()
        .setAuthor({
            name: 'Voting Is Open.',
            iconURL: 'https://raw.githubusercontent.com/ryntab/TendieTrend/refs/heads/master/assets/tendie_trend_Logo.png',
        })
        .setImage(proxyImage('https://bantanaoriginbucket.s3.us-east-1.amazonaws.com/screenshot-2025-04-11-20-27-37.png'))
        .setDescription(`Voting for **${formatted}** is now **Open**.\n\nUse the reaction buttons to cast your vote for today's market direction.\n\nPolls close ${relativeTime}`)
        .setColor(0x5f5f5f)
        .setFooter({ text: 'TendieTrend' })
        .setTimestamp();

    const message = await channel.send({ embeds: [embed] });

    await message.react('🟢');
    await message.react('🔴');

    // Save active message ID in Redis
    await redis.set(`active_vote_message:${guildId}`, message.id);

    return message;
}

// Send 30 minutes before market open.
export async function sendVotingClosingAlert(channel) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "Market Opens Soon!",
            iconURL: "https://raw.githubusercontent.com/ryntab/TendieTrend/refs/heads/master/assets/tendie_trend_Logo.png",
        })
        .setDescription(`Last chance to cast your vote for **Today**\n\n Polls close in **<t:${unixTimestamp}:R>**`)
        .setImage(proxyImage("https://raw.githubusercontent.com/ryntab/TrumpBot/refs/heads/master/assets/Discord-Trump-Decoration-Alt.png"))
        .setColor(0xFFA500)
        .setTimestamp();

    await channel.send({ embeds: [embed] });
}

// Send at market open.
export async function sendMarketOpenAlert(channel) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "*Ding Ding* Market Open!",
            iconURL: "https://raw.githubusercontent.com/ryntab/TendieTrend/refs/heads/master/assets/tendie_trend_Logo.png",
        })
        .setColor(0x00FF00)
        .setTimestamp();
    await channel.send({ embeds: [embed] });
}

// Send at market close.
export async function sendMarketCloseAlert(channel) {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "*Ding Ding* Market Closed!",
            iconURL: "https://raw.githubusercontent.com/ryntab/TendieTrend/refs/heads/master/assets/tendie_trend_Logo.png",
        })
        .setColor(0x00FF00)
        .setTimestamp();
    await channel.send({ embeds: [embed] });
}

export async function handleVote(reaction, user) {
    if (user.bot) return;

    const emoji = reaction.emoji.name;
    const guildId = reaction.message.guildId;
    if (!guildId) return;

    // Validate emoji
    if (!['🟢', '🔴'].includes(emoji)) {
        await reaction.users.remove(user.id).catch(() => { });
        console.log(`❌ Invalid emoji from ${user.tag}: ${emoji}`);
        return;
    }

    //Check voting status
    if (!isVotingOpen(guildId)) {
        await reaction.users.remove(user.id).catch(() => { });
        console.log(`⏰ Voting closed — removed ${user.tag}'s reaction`);
        return;
    }

    const voteRef = vote(guildId, user.id);

    // Ensure it's the active message
    const isValid = await voteRef.isFromActiveMessage(reaction.message.id);
    if (!isValid) {
        await reaction.users.remove(user.id).catch(() => { });
        console.log(`🧽 Ignored stale vote from ${user.tag} on old message`);
        return;
    }

    // Remove previous vote if different
    const previous = await voteRef.get();
    if (previous && previous !== emoji) {
        const other = reaction.message.reactions.cache.get(previous);
        if (other) await other.users.remove(user.id).catch(() => { });
    }

    await voteRef.set(emoji);
    console.log(`✅ ${user.tag} voted ${emoji} in ${guildId}`);
}