import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import AmagiClient from "../../../instances/classes/client/AmagiClient";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("subscribe")
        .setDescription("Subscribes bot to voice channel")
        .addChannelOption((option) => option
            .setName("channel")
            .setDescription("Choice of channel")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        ),
    usage: "subscribe",
    return: "Adds bot to user's current voice channel",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });
        let reply: string = "Bot has joined voice channel."
        const voiceChannel = interaction.options.getChannel('channel');

        try {
            joinVoiceChannel({
                channelId: voiceChannel!.id,
                guildId: interaction.guildId!,
                adapterCreator: interaction.guild!.voiceAdapterCreator
            });
        } catch (error) {
            reply = "Something went wrong when trying to join voice channel."
            console.log(client.failure("[ERROR] ") + "Unable to get into voice chat server.");
            console.error(error);
        } finally {
            await interaction.editReply({
                content: reply
            });
        }
    }
}