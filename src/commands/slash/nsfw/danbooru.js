const { SlashCommandBuilder } = require("discord.js");
const {
  BAD_TAG_MSG,
  NOT_IN_A_NSFW_CHANNEL_MSG,
  STANDARD_ERROR_MSG,
  TOO_MANY_TAGS_MSG,
} = require("./shared/config/fetchErrors.json");
const { MAX_TAGS } = require("./danbooru/config/danbooruParameters.json");
const { constainsBadTag } = require("./shared/functions/tagValidation");
const { getPhoto } = require("./danbooru/functions/getPhotoDanbooru");
const { SFW } = require("../../../json/config.json")

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

    let newMsg = STANDARD_ERROR_MSG;
    if (!interaction.channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Clean up tags
      const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;:|]/g;
      let tag = interaction.options.getString("tag") ?? "azur_lane";
      tag = tag.toLowerCase().replace(filter, "");
      const tagList = tag.split(" ");
      let allowed_tag_amount = MAX_TAGS;
      if (SFW) {
        allowed_tag_amount -= 1
      }
      if (tagList.length > allowed_tag_amount) {
        newMsg = TOO_MANY_TAGS_MSG + allowed_tag_amount;
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