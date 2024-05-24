import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { createReadStream } from 'node:fs';
import filterQuery from "../../../instances/classes/voice/sound/SoundTagFilter";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("soundlist")
        .setDescription("A list of playable sounds"),
    usage: "soundlist",
    return: "Returns a list of sounds.",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });
        let reply: string = "Below is the list of sounds that can be played:";
        for (const sound of client.soundList.keys()) {
            reply += `\n${sound}`
        }
        await interaction.editReply({
            content: reply
        });
    }
}