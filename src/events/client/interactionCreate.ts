import { Interaction, Collection } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import GuildModel from "../../schemas/guild"

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction: Interaction, client: AmagiClient) {
    const { cooldowns } = client;

    if (interaction.isChatInputCommand()) {
      const { slashCommands } = client;
      const { commandName } = interaction;
      const command = slashCommands.get(commandName);

      if (!command) return;

      // Add Collection for command if it does not currently exist
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      if (!interaction.inGuild()) {
        return await interaction.reply({
          content: "Command must be used inside of guild",
        });
      }

      let query = null;
      try {
        query = await GuildModel.findOneAndUpdate({guildID: interaction.guildId}, {$setOnInsert: {guildID: interaction.guildId}}, { upsert: true, new: true, setDefaultsOnInsert: true });
        if (!query) {
          throw new Error("No query returned in interactionCreate event.");
        }
      } catch (error) {
        console.log(client.failure("[ERROR] ") + "There was an error accessing database within interactionCreate event.")
        return await interaction.reply({
          content: "Command must be used inside of guild",
        });
      }

    if (Array.isArray(query.denyList) && query.denyList.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "You are currently banned from the bot. Please contact your guild's moderator or admin.",
        ephemeral: true,
      });
    }
      // Get time
      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name)!;
      const defaultCooldownDuration = 5;
      const cooldownAmount =
        (command.cooldown ?? defaultCooldownDuration) * 1000;

      // Current cooldown exists for user of that command
      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id)! + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
            return await interaction.reply({
            content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true,
          }).then((reply) => {
            setTimeout(() => reply.delete(), 5000);
          }).catch((error: Error) => {
            console.error(error);
            interaction.reply("There was an error trying to execute that command!");
          });
        }
      }

      // Set timer to remove cooldown
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: "Something went wrong when running this command",
          ephemeral: true,
        });
      }
    }
  },
};
