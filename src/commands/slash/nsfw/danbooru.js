const { SlashCommandBuilder } = require("discord.js");
const {
  BAD_TAG_MSG,
  NOT_IN_A_NSFW_CHANNEL_MSG,
  STANDARD_ERROR_MSG,
  TOO_MANY_TAGS_MSG,
} = require("./config/fetchErrors.json");
const { Danbooru } = require("./functions/danbooruObject");

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
    const msg = await interaction.deferReply();
    let newMsg = STANDARD_ERROR_MSG;
    if (!interaction.channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Check if passed tags are valid
      let tag = interaction.options.getString("tag") ?? "azur_lane";
      let d = new Danbooru(tag)
      let allowed_tag_amount = d.max_tags;
      if (d.sfw) {
        allowed_tag_amount -= 1;
      }
      if (d.tagList.length > allowed_tag_amount) {
        newMsg = TOO_MANY_TAGS_MSG + allowed_tag_amount;
      } else if (d.constainsBadTag()){
        newMsg = BAD_TAG_MSG;
      } else {
        newMsg = await d.getPhoto();
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};