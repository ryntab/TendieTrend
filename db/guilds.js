import knex from "#utilities/knex.js";


class GuildsDB {
    async markGuildAsManaged(guild) {

        console.log(guild)
        try {
          const existing = await knex('servers').where({ discord_id: guild.id }).first();
          
      
          if (existing) {
            await knex('servers')
              .where({ discord_id: guild.id })
              .update({
                is_managed: true,
                synced_at: knex.fn.now(),
              });
            console.log(`🔄 Updated guild ${guild.name} (${guild.id})`);
          } else {
            await knex('servers').insert({
              discord_id: guild.id,
              name: guild.name,
              is_managed: true,
              synced_at: knex.fn.now(),
            });
            console.log(`✅ Inserted new guild ${guild.name} (${guild.id})`);
          }
        } catch (err) {
          console.error(`❌ Failed to mark guild ${guild.id} as managed:`, err);
        }
      }
}

export default new GuildsDB();