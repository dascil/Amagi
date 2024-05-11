import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { createReadStream } from 'node:fs';
import filterQuery from "../../../instances/classes/voice/sound/SoundTagFilter";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sound")
        .setDescription("Plays sound to voice channel")
        .addStringOption((option) => option
            .setName("name")
            .setDescription("Name of the sound")
            .setRequired(true)
        ),
    usage: "sound [sound]",
    return: "Plays sound in voice channel.",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });
        let reply: string = "You must be in a voice channel to use this command.";
        try {
            // Filtered to prevent execution of malicious users
            const query = filterQuery(interaction.options.getString("name")!);

            // Case: Sound file exists
            if (client.soundList.has(query)) {
                // Get voice connection or create one
                let connection = getVoiceConnection(interaction.guildId!);
                // Bot has been set up to only be allow to do commands within a guild.
                const commandUser = await interaction.guild!.members.fetch(interaction.user.id);
                const voiceChannel = commandUser.voice.channel;
                if (voiceChannel !== null) {
                    // Joins user's voice channel if not in a voice channel, or incorrect voice channel.
                    if (connection === undefined || connection.joinConfig.channelId !== null || voiceChannel !== connection.joinConfig.channelId) {
                        connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: interaction.guildId!,
                            adapterCreator: interaction.guild!.voiceAdapterCreator,
                            selfMute: false,
                            selfDeaf: true,
                        });
                    }
                    // Creates and plays resource
                    const player = createAudioPlayer();
                    const resource = createAudioResource(createReadStream(client.soundList.get(query)!));
                    connection?.subscribe(player);
                    reply = "Playing sound file."
                    player.play(resource);
                }
            } else { // Case: No sound by that name
                reply = "No sound file with that name exists.";
            }
        } catch (error) {
            reply = "Something went wrong when emitting sound.";
            console.log(client.failure("[ERROR] ") + "Unable to emit sound into voice chat server.");
            console.error(error);
        }
        await interaction.editReply({
            content: reply
        });
    }
}