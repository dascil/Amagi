const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const { slashCommands } = client;
            const { commandName} = interaction;
            const command = slashCommands.get(commandName);

            if (!command)
                return;

            try {
                await command.execute(interaction, client);
            } catch (err) {
                console.error(err)
                await interaction.reply({
                    content: 'Something went wrong when running this command',
                    ephemeral: true
                });
            }
        } else if (interaction.isContextMenuCommand()) {
            const { commands } = client;
            const { commandName} = interaction;
            const contextCommand = commands.get(commandName);

            if (!contextCommand)
                return;

            try {
                await contextCommand.execute(interaction, client);
            } catch (err) {
                console.error(err)
            }

        }
    }
}