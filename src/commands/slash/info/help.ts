import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import GuildModel from "../../../schemas/guild"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Explains Return my ping!')
        .addSubcommand(subcommand => subcommand
            .setName("command")
            .setDescription("Get information about a specific command")
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
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("list")
            .setDescription("List all of the commands in DMs")
        ),
    usage: "help {command}",
    return: "Below is a list of help commands:\n\n \
            `command`\n \
            Retrieve command usage based on specifications \n \
            **Parameters:** `type` **Required:** True, `command` **Required:** True \n\n \
            `list` \n \
            Recieve a DM of a list of commands",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();
        let newMsg = "Commands can only be done in servers.";
        if (interaction.guildId) {
            const subcommand = interaction.options.getSubcommand();
            let prefix: null | string = null;
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

            if (prefix) {
                // Only continues command if server configurations are in database.
                // Returns command usage if command exists
                if (subcommand === "command") {
                    newMsg = "Command does not exist. Please type a valid command."
                    const commandType = interaction.options.getString("type", true);
                    const commandName = interaction.options.getString("command", true).toLowerCase();
                    const commandPrefix = commandType === "prefix" ? prefix : "/";
                    const command = commandType === "prefix" ? client.prefixCommands.get(commandName) : client.slashCommands.get(commandName);

                    if (command !== undefined) {
                        newMsg = `**Usage:** \`${commandPrefix}${command.usage}\`\n${command.return}`;
                    }
                } else {
                    let prefixCommandMessage = "**--Prefix Commands--**\n\n";
                    let slashCommandMessage = "**--Slash Commands--**\n\n";
                    client.prefixCommands.forEach(command => {
                        prefixCommandMessage += `**${prefix}${command.usage}**: ${command.return}\n`;
                    });
                    client.slashCommands.forEach(command => {
                        slashCommandMessage += `**/${command.usage}**: ${command.return}\n`;
                    });

                    await interaction.user.send({content: prefixCommandMessage + "\n" + slashCommandMessage});
                    newMsg = "Check your DMs for command manual.";
                }
            }
        }
        await interaction.editReply({
            content: newMsg
        });
    },
};