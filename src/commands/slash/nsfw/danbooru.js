const { SlashCommandBuilder } = require("discord.js");
const {
  BAD_TAG_MSG,
  NOT_IN_A_NSFW_CHANNEL_MSG,
  TOO_MANY_TAGS_MSG,
} = require("./config/danbooruErrors.json");
const { getPhoto } = require("./helperFunctions/getPhotoDanbooru");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("danbooru")
    .setDescription(
      "Return random image based on tags. Separate tags by space. Limit 2."
    )
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("Tag of desired photo")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const msg = await interaction.deferReply({
      fetchReply: false,
    });
    if (!interaction.channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Clean up tags
      const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;:|]/g;
      let tag = interaction.options.getString("tag") ?? "azur_lane";
      tag = tag.toLowerCase().replace(filter, "");
      const tagList = tag.split(" ");

      switch (tagList) {
        case tagList.length >= 3:
          newMsg = TOO_MANY_TAGS_MSG;
          break;

        case tagList.includes("loli") || tagList.includes("shota"):
          newMsg = BAD_TAG_MSG;
          break;

        default:
          newMsg = await getPhoto(tag, tagList);
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};