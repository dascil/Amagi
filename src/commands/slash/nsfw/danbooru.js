const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("danbooru")
    .setDescription(
      "Gives random danbooru image of specified tag. Use underscore for spaces. Default tag is azur_lane"
    )
    .addStringOption((option) =>
      option.setName("tag").setDescription("Tag to look up").setRequired(false)
    ),
  async execute(interaction, client) {
    const msg = await interaction.deferReply({
      fetchReply: false,
    });

    try {
      const tag = interaction.options.getString("tag") ?? "azur_lane";
      let url = "https://danbooru.donmai.us/posts/random.json?tags=" + tag;
      let jsonOBJ = await fetch(url);
      if (!jsonOBJ.ok) {
        throw new Error(await jsonOBJ.text());
      }
      jsonOBJ = await jsonOBJ.json();

      if (!jsonOBJ.hasOwnProperty("file_url")) {
        throw new Error("Returned JSON object does not contain a file.");
      }
      const newMsg = jsonOBJ.file_url;
      await interaction.editReply({
        content: newMsg,
      });
    } catch (err) {
      console.log(err);
      const newMsg = `Something went wrong :( \n Please make sure that your spelling is correct.\n Your tag might also require the series (i.e. fischl_(genshin_impact)) \n If this problem persists, please contact an admin.`;
      await interaction.editReply({
        content: newMsg,
      });
    }
  },
};
