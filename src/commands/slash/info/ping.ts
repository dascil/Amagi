import { ChatInputCommandInteraction } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Return my ping!'),
    usage: "ping",
    return: "Returns the user's and the bot's ping.",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        const msg = await interaction.deferReply({
            fetchReply: true
        });

        const newMsg = `Bot Latency: ${client.ws.ping}ms\nUser Ping: ${msg.createdTimestamp - interaction.createdTimestamp}ms`;
        await interaction.editReply({
            content: newMsg
        });
    },
};