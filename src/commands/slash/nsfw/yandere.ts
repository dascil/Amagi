import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BAD_TAG_MSG, NOT_IN_A_NSFW_CHANNEL_MSG, STANDARD_ERROR_MSG, TOO_MANY_TAGS_MSG } from "./config/fetchErrors.json";
import Yandere from "./functions/YandereObject";
import AmagiClient from "../../../ClientCommandObjects/AmagiClient";

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
  async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
    const msg = await interaction.deferReply();

    let newMsg = STANDARD_ERROR_MSG;
    let channel: any = interaction.channel;
    if (!channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Clean up tags
      let tag = interaction.options.getString("tag") ?? "azur_lane";
      const y = new Yandere(tag);
      if (y.tagList.length > y.maxTags) {
        newMsg = TOO_MANY_TAGS_MSG + y.maxTags;
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