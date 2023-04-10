const { SlashCommandBuilder } = require("discord.js");
const { tagSuggestor } = require("./helperFunctions/tagSuggestionDanbooru");
const { handleError } = require("./helperFunctions/handleError");
const {BAD_TAG_MSG, NOT_IN_A_NSFW_CHANNEL_MSG, STANDARD_ERROR_MSG} = require("./config/danbooruErrors.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription(
      "Gives a list of tags that are similar to input. Accepts only one tag."
    )
    .addStringOption((option) =>
      option.setName("tag").setDescription("Tag to look up").setRequired(true)
    ),
  async execute(interaction, client) {
    const msg = await interaction.deferReply({
      fetchReply: false,
    });

    let newMsg = STANDARD_ERROR_MSG;

    if (!interaction.channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      let tag = interaction.options.getString("tag");
      // Filter out special characters.
      const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;:|\s]/g;
      tag = tag.replace(filter, "").toLowerCase();
      // Catch unsearchable tags
      if (tag === "loli" || tag === "shota") {
        newMsg = BAD_TAG_MSG;
      } else {
        try {
          newMsg = await tagSuggestor(tag);
          // Logs any error that occured
        } catch (error) {
          handleError(error);
        }
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};
