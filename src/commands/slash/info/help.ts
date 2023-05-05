import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import GuildModel from "../../../schemas/guild"
const defaultPrefix = process.env["PREFIX"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Explains Return my ping!')
        .addSubcommandGroup(group => group
            .setName("prefix")
            .setDescription("Manual for prefix commands")
            .addSubcommand(command => command
                .setName("lr")
                .setDescription("Manual for prefix ping command")
            )
            .addSubcommand(command => command
                .setName("ping")
                .setDescription("Manual for prefix ping command")
            )
            .addSubcommand(command => command
                .setName("podium")
                .setDescription("Manual for prefix podium command")
            )
        )
        .addSubcommandGroup(group => group
            .setName("slash")
            .setDescription("Manual for slash commands")
            .addSubcommand(command => command
                .setName("help")
                .setDescription("Manual for slash help command")
            )
            .addSubcommand(command => command
                .setName("lr")
                .setDescription("Manual for slash lr command")
            )
            .addSubcommand(command => command
                .setName("ping")
                .setDescription("Manual for slash ping command")
            )
            .addSubcommand(command => command
                .setName("podium")
                .setDescription("Manual for slash podium command")
            )
            .addSubcommand(command => command
                .setName("sauce")
                .setDescription("Manual for slash sauce command")
            )
        ),
    usage: "help {prefix/slash} {command}",
    return: "Returns how to used specified command",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();
        let prefix = null;
        let newMsg = "No command found by that name";
        try {
            const query = await GuildModel.findOne({ guildID: interaction.guildId });
            if (query) {
                prefix = query.prefix;
            } else {
                const newGuild = new GuildModel({ guildID: interaction.guildId });
                await newGuild.save();
                prefix = defaultPrefix;
            }
        } catch (error) {
            console.log(client.failure("[ERROR] ") + "Unable to get prefix from database.")
            newMsg = "There was a problem reaching our servers. Please try again later."
        }
        if (prefix) {
            if (interaction.options.getSubcommandGroup() === "prefix") {
                const commandName = interaction.options.getSubcommand();
                const command = client.prefixCommands.get(commandName);
                if (command !== undefined) {
                    newMsg = `**Usage:** \`${prefix}${command.usage}\`\n${command.return}`
                }
            } else {
                const commandName = interaction.options.getSubcommand();
                const command = client.slashCommands.get(commandName);
                if (command !== undefined) {
                    if (commandName)
                        newMsg = `**Usage:** \`/${command.usage}\`\n${command.return}`
                }
            }
        }
        await interaction.editReply({
            content: newMsg
        });
    },
};