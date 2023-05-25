import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import GuildModel from "../../../schemas/guild"
import AmagiClient from "../../../instances/classes/client/AmagiClient";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('options')
        .setDescription('Change server options.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(command => command
            .setName('sfw')
            .setDescription("Force sauce command to be SFW everywhere")
            .addBooleanOption(option => option
                .setName("on")
                .setDescription("Force safe for work everywhere")
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName('prefix')
            .setDescription("Change prefix for server")
            .addStringOption(option => option
                .setName("prefix")
                .setDescription("Change prefix for server")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(3)
            )
        ),
    usage: "options {subcommand}",
    return: "Changes bot server settings.",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();
        const subCommand = interaction.options.getSubcommand();
        let newMsg = "There was a problem reaching our database.\nPlease try again or contact your admin.";
        let guild;
        try {
            // Updates option or adds guild configurations to database if entry does not exist
            switch (subCommand) {
                case "sfw": {
                    guild = await GuildModel.findOneAndUpdate(
                        { guildID: interaction.guildId },
                        { sfw: interaction.options.getBoolean("on") },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    break;
                }
                case "prefix": {
                    guild = await GuildModel.findOneAndUpdate(
                        { guildID: interaction.guildId },
                        { prefix: interaction.options.getString("prefix") },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    break;
                }
                default: {
                    break;
                }
            }
            if (guild) {
                newMsg = `The ${subCommand} option has been changed.`;
            } else {
                newMsg ="There was a problem updating your selected option"
            }
        } catch (error) {
            console.log(client.failure("[ERROR] ") + "Unable to get prefix from database.");
            console.log(error);
        }
        await interaction.editReply({
            content: newMsg
        });
    },
};