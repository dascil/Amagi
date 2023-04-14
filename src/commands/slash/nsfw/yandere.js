const { SlashCommandBuilder } = require("discord.js");
const {
  BAD_TAG_MSG,
  NOT_IN_A_NSFW_CHANNEL_MSG,
  STANDARD_ERROR_MSG,
  TOO_MANY_TAGS_MSG,
} = require("./shared/config/fetchErrors.json");
const { MAX_TAGS } = require("./yandere/config/yandereParameters.json");
const { SFW } = require("../../../json/config.json")
const { constainsBadTag } = require("./shared/functions/tagValidation");
const { getPhoto } = require("./yandere/functions/getPhotoYandere");

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
    const msg = await interaction.deferReply({
      fetchReply: false,
    });

    let newMsg = STANDARD_ERROR_MSG;
    if (!interaction.channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Clean up tags
      const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;:|]/g;
      let tag = interaction.options.getString("tag") ?? "azur_lane";
      tag = tag.toLowerCase().replace(filter, "");
      const tagList = tag.split(" ");
      if (tagList.length > MAX_TAGS) {
        newMsg = TOO_MANY_TAGS_MSG + MAX_TAGS;
      } else if (constainsBadTag(tagList)){
        newMsg = BAD_TAG_MSG;
      } else {
        newMsg = await getPhoto(tag, tagList, SFW);
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};