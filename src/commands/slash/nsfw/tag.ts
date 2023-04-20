import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BLACKLIST } from "./config/fetchParameter.json";
import { BAD_TAG_MSG, NOT_IN_A_NSFW_CHANNEL_MSG, STANDARD_ERROR_MSG } from "./config/fetchErrors.json";
import AmagiClient from "../../../objects/AmagiClient";
import Danbooru from "./functions/DanbooruObject";
import Yandere from "./functions/YandereObject";
import handleError from "./functions/handleError";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription(
      "Gives a list of tags that are similar to input. Accepts only one tag."
    )
    .addStringOption((option) => option.setName("tag")
      .setDescription("Tag to look up")
      .setRequired(true))
    .addStringOption((option) => option.setName("board")
      .setDescription("Board to look tag up on")
      .setRequired(true)
      .addChoices({name: 'Danbooru', value: "danbooru"},{name: "Yandere", value: "yandere"})),
  async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
    const msg = await interaction.deferReply();

    let newMsg = STANDARD_ERROR_MSG;

    let channel: any = interaction.channel!;
    if (channel.nsfw) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      let tag = interaction.options.getString("tag")!;
      const board = interaction.options.getString("board");
      // Filter out special characters.
      const filter = /[{}<>\[\]/\\+*!?$%&*=~'"`;:|\s]/g;
      tag = tag.replace(filter, "").toLowerCase();
      // Catch unsearchable tags
      if (BLACKLIST.includes(tag)) {
        newMsg = BAD_TAG_MSG;
      } else {
        try {
          if (board === "danbooru") {
            let d = new Danbooru(tag);
            newMsg = await d.getTagSuggestions(d.tag);
          } else {
            let y = new Yandere(tag)
            newMsg = await y.getTagSuggestions(y.tag);
          // Logs any error that occured
          }
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
