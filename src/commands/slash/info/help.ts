import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import GuildModel from "../../../schemas/guild"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Explains Return my ping!')
        .addStringOption(option => option
            .setName("type")
            .setDescription("Type of command to search")
            .setRequired(true)
            .addChoices({ name: "prefix", value: "prefix" }, { name: "slash", value: "slash" })
        )
        .addStringOption(option => option
            .setName("command")
            .setDescription("Command to look up usage of")
            .setRequired(true)
        ),
    usage: "help {prefix/slash} {command}",
    return: "Returns how to used specified command",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();

        let newMsg = "Commands can only be done in servers.";
        if (interaction.guildId) {
            let prefix = null;
            newMsg = "No command was found found by that name.";
            // Gets server's prefix or add default prefix if guild does not exist in server
            try {
                const query = await GuildModel.findOneAndUpdate(
                    { guildID: interaction.guildId },
                    { $setOnInsert: { guildID: interaction.guildId } },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                if (query) {
                    prefix = query.prefix;
                } else {
                    newMsg = "There was a problem accessing the database.\n Please try again later.";
                }
            } catch (error) {
                console.log(client.failure("[ERROR] ") + "Unable to get prefix from database.");
                console.error(error);
                newMsg = "Unable to access database at this time.\nPlease try again later.";
            }
            // Only continues command if server configurations are in database.
            if (prefix) {
                // Returns command usage if command exists
                const commandType = interaction.options.getString("type", true);
                const commandName = interaction.options.getString("command", true).toLowerCase();
                const commandPrefix = commandType === "prefix" ? prefix : "/";
                const command = commandType === "prefix" ? client.prefixCommands.get(commandName) : client.slashCommands.get(commandName);

                if (command !== undefined) {
                    newMsg = `**Usage:** \`${commandPrefix}${command.usage}\`\n${command.return}`
                }
            }
        }
        await interaction.editReply({
            content: newMsg
        });
    },
};