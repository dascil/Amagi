import { ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import GuildModel from "../../../schemas/guild"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDescription("Prevent user from using the bot.")
        .addStringOption(option => option
            .setName("choice")
            .setDescription("Choose to ban or unban bot services")
            .setRequired(true)
            .addChoices(
                { name: "ban", value: "ban" },
                { name: "unban", value: "unban" }
            )
        )
        .addUserOption(option => option
            .setName("user")
            .setDescription("User to ban or unban")
            .setRequired(true)
        ),
    usage: "ban",
    return: "A confirmation that a user has been banned or unbanned",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();
        const choice = interaction.options.getString("choice")!;
        const user = interaction.options.getUser("user");
        let newMsg = "User does not exist.";
        if (user) {
            newMsg = `There was a problem with ${choice}ning the user.`

            if (interaction.guild) {
                newMsg = "An admin cannot be banned from a bot."
                let guildMember;
                try {
                    guildMember = await interaction.guild.members.fetch(user.id);
                } catch (error) {
                    console.log("User not found");
                    console.log(error);
                // Bans/Unbans a user and checks if existing records exist in database
                // Edge case added in case user is banned but, is later promoted to admin
                } if (guildMember && !guildMember.permissionsIn(interaction.channelId).has(PermissionsBitField.All) || choice === "unban") {
                    try {
                        if (choice === "ban") {
                            const result = await GuildModel.findOneAndUpdate(
                                { guildID: interaction.guildId },
                                { $addToSet: { denyList: user.id } },
                                { upsert: true, new: true, setDefaultsOnInsert: true }
                            );
                        } else {
                            const result = await GuildModel.findOneAndUpdate(
                                { guildID: interaction.guildId },
                                { $pull: { denyList: user.id } },
                                { upsert: true, new: true, setDefaultsOnInsert: true }
                            );
                        }
                        newMsg = `${user.username} has been ${choice}ned from this bot.`
                    } catch (error) {
                        console.log(client.failure("[ERROR] " + "There was an error with the ban command"))
                        console.error(error)
                    }
                }
            }
        }
        await interaction.editReply({
            content: newMsg
        })
    }
}