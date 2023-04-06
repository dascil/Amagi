const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Return my ping!'),
    async execute(interaction, client) {
        const msg = await interaction.deferReply({
            fetchReply: true
        });

        const newMsg = `Bot Latency: ${client.ws.ping}ms\nUser Ping: ${msg.createdTimestamp - interaction.createdTimestamp}ms`;
        await interaction.editReply({
            content: newMsg
        });
    },
};