import { VoiceState } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = {
    name: "voiceStateUpdate",
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState, client: AmagiClient) {
        if (oldState.channel && oldState.channel.members.size === 1) {
            const connection = getVoiceConnection(oldState.guild.id);
            if (connection && connection.joinConfig.channelId === oldState.channelId) {
                connection.destroy();
                // TODO: Destroy connected Audio Player
            }
        }
    }
}