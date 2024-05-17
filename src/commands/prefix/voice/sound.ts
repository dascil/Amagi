import { Message } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { createReadStream } from 'node:fs';
import filterQuery from "../../../instances/classes/voice/sound/SoundTagFilter";

module.exports = {
    name: "sound",
    description: "Play's sound in user's voice chat",
    usage: "sound [selected sound]",
    return: "A sound in the voice chat the user is in.",
    cooldown: 3,
    async execute(message: Message, args: Array<string>, client: AmagiClient) {
        if (args.length === 1) {
            let reply: string = "You must be in a voice channel to use this command.";
            try {
                // Filtered to prevent execution of malicious users
                const query = filterQuery(args[0]).toLowerCase();

                // Case: Sound file exists
                if (client.soundList.has(query)) {
                    // Get voice connection or create one
                    let connection = getVoiceConnection(message.guildId!);
                    // Bot has been set up to only be allow to do commands within a guild.
                    const commandUser = await message.guild!.members.fetch(message);
                    const voiceChannel = commandUser.voice.channel;
                    if (voiceChannel !== null) {
                        // Joins user's voice channel if not in a voice channel, or incorrect voice channel.
                        if (connection === undefined || connection.joinConfig.channelId !== null || voiceChannel !== connection.joinConfig.channelId) {
                            connection = joinVoiceChannel({
                                channelId: voiceChannel.id,
                                guildId: message.guildId!,
                                adapterCreator: message.guild!.voiceAdapterCreator,
                                selfMute: false,
                                selfDeaf: true,
                            });
                        }
                        // Gets existing player or creates a new one
                        let player = client.audioPlayers.get(message.guildId!);
                        if (!player) {
                            player = createAudioPlayer();
                            client.audioPlayers.set(message.guildId!, player);
                        }
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
            message.reply({
                content: reply,
            });
        }
    },
};