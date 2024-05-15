import { VoiceState } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import { getVoiceConnection } from "@discordjs/voice";

module.exports = {
    name: "voiceStateUpdate",
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState, client: AmagiClient) {
        // First conditional if bot is disconnected
        // Second conditional if bot is the only member remaining in a chat
        if (!newState.channel && oldState.member && oldState.member.id === client.id || oldState.channel && oldState.channel.members.size === 1 && oldState.channel.members.get(client.id)) {
            const connection = getVoiceConnection(oldState.guild.id);
            if (connection && connection.joinConfig.channelId === oldState.channelId) {
                const player = client.audioPlayers.get(oldState.guild.id);
                if (player) {
                    player.stop();
                    client.audioPlayers.delete(oldState.guild.id);
                }
                connection.destroy();
                // TODO: Destroy connected Audio Player
            }
        }
    }
}