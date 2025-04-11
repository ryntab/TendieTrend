// services/buildEmbed.js
import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } from 'discord.js';
  
  /**
   * @param {Object} options
   * @param {'poll' | 'results'} options.type - Embed type
   * @param {string} [options.marketResult] - 'up' or 'down'
   * @param {Array<string>} [options.topUsers] - usernames of top guessers
   * @param {string} [options.voteUrl] - URL to cast a vote
   */
  export function buildTendieEmbed({ type, marketResult, topUsers = [], voteUrl }) {
    const embed = new EmbedBuilder()
      .setColor(type === 'poll' ? 0xfcd34d : marketResult === 'up' ? 0x22c55e : 0xef4444)
      .setTimestamp(new Date());
  
    if (type === 'poll') {
      embed
        .setTitle('📊 TendieTrend Daily Poll')
        .setDescription('Will the market close **green 📈** or **red 📉** today?');
    }
  
    if (type === 'results') {
      const isUp = marketResult === 'up';
      embed
        .setTitle('📈 TendieTrend Results')
        .setDescription(
          `The market closed **${isUp ? 'green 📈' : 'red 📉'}** today.\n\n` +
          (topUsers.length > 0
            ? `Top predictors: ${topUsers.map(u => `@${u}`).join(', ')}`
            : '_No winners today_')
        );
    }
  
    const components = voteUrl
      ? [new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('🗳️ Vote Now')
            .setStyle(ButtonStyle.Link)
            .setURL(voteUrl)
        )]
      : [];
  
    return {
      embeds: [embed],
      components
    };
  }
  