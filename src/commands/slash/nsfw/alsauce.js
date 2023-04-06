const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alsauce')
        .setDescription('Gives random Azur Lane image')
        .nsfw(1),
    async execute(interaction, client) {
        const msg = await interaction.deferReply({
            fetchReply: true
        });

        try {
            let jsonOBJ = await fetch('https://danbooru.donmai.us/posts/random.json?tags=azur_lane');
            if (!jsonOBJ.ok) {
                throw new Error(await jsonOBJ.text());
            }
            jsonOBJ = await jsonOBJ.json();

            if (!jsonOBJ.hasOwnProperty('file_url')) {
                throw new Error('Returned JSON object does not contain a file.')
            }
            const newMsg = jsonOBJ.file_url;
            await interaction.editReply({
                content: newMsg
            });
        } catch (err) {
            console.log(err)
            const newMsg = `Something went wrong. Unable to retrieve photo.\n Please try again or contact admin`;
            await interaction.editReply({
                content: newMsg
            });
        }
    },
};