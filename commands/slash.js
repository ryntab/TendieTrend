import {
    SlashCommandBuilder,
    ChannelType,
    PermissionsBitField,
    Routes,
    REST
  } from 'discord.js';
  import { client } from '../core/client.js';
  import { redis } from '../db/redis.js';
  
  export async function registerCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set the channel where TendieTrend posts voting alerts')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Target channel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addBooleanOption(option =>
          option.setName('force')
            .setDescription('Forcefully override previous channel')
        )
    ];
  
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands.map(cmd => cmd.toJSON()),
    });
  
    client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;
      if (interaction.commandName !== 'setchannel') return;
  
      const channel = interaction.options.getChannel('channel');
      const force = interaction.options.getBoolean('force') ?? false;
  
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({ content: '🚫 You need **Manage Server** permissions.', ephemeral: true });
      }
  
      const guildId = interaction.guildId;
      const existingChannelId = await redis.get(`active_vote_channel:${guildId}`);
  
      if (existingChannelId && existingChannelId !== channel.id && !force) {
        return interaction.reply({
          content: `⚠️ Voting is already configured to use <#${existingChannelId}>.\nUse \`/setchannel\` again with \`force: true\` to override it.`,
          ephemeral: true
        });
      }
  
      // Save new channel + clear any active message
      await redis.set(`active_vote_channel:${guildId}`, channel.id);
      await redis.del(`active_vote_message:${guildId}`);
  
      return interaction.reply({
        content: `✅ TendieTrend will now post voting alerts to ${channel}.`,
        ephemeral: true
      });
    });
  }
  