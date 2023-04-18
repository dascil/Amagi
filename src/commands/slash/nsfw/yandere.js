const { SlashCommandBuilder } = require("discord.js");
const {
  BAD_TAG_MSG,
  NOT_IN_A_NSFW_CHANNEL_MSG,
  STANDARD_ERROR_MSG,
  TOO_MANY_TAGS_MSG,
} = require("./config/fetchErrors.json");
const { Yandere } = require("./functions/yandereObject");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yandere")
    .setDescription(
      "Return random image based on tags. Separate tags by space. Limit 4."
    )
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("Tag of desired photo")
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const msg = await interaction.deferReply();

    let newMsg = STANDARD_ERROR_MSG;
    if (!interaction.channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Clean up tags
      let tag = interaction.options.getString("tag") ?? "azur_lane";
      const y = new Yandere(tag);
      if (y.tagList.length > y.max_tags) {
        newMsg = TOO_MANY_TAGS_MSG + y.max_tags;
      } else if (y.containsBadTag(y.tagList)){
        newMsg = BAD_TAG_MSG;
      } else {
        newMsg = await y.getPhoto();
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};