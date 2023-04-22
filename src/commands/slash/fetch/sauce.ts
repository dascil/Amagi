import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BAD_TAG_MSG, NOT_IN_A_NSFW_CHANNEL_MSG, STANDARD_ERROR_MSG, TOO_MANY_TAGS_MSG } from "./config/fetchErrors.json";
import { SFW } from "../../../json/config.json";
import AmagiClient from "../../../client/AmagiClient";
import Danbooru from "./functions/Danbooru";
import Yandere from "./functions/Yandere";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sauce")
    .setDescription(
      "Return random image based on tags and photo board. Separate tags by space."
    )
    .addSubcommand((subcommand) => subcommand.setName('quick')
      .setDescription("Get photo from Danbooru. Default tag: azur_lane")
      .addStringOption((option) => option.setName("tag").setDescription("Name of tag").setRequired(false))
    )
    .addSubcommand((subcommand) => subcommand.setName('detailed')
      .setDescription("Get photo from selected image board and selected tags.")
      .addStringOption((option) => option.setName("board").setDescription("Board to look tag up on").setRequired(true).addChoices({ name: 'Danbooru', value: "danbooru" }, { name: "Yandere", value: "yandere" }))
      .addStringOption((option) => option.setName("tag").setDescription("Name of tag").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName('tag')
      .setDescription("Get tag suggestions on selected board. Ignores input after first space.")
      .addStringOption((option) => option.setName("board").setDescription("Board to look tag up on").setRequired(true).addChoices({ name: 'Danbooru', value: "danbooru" }, { name: "Yandere", value: "yandere" }))
      .addStringOption((option) => option.setName("tag").setDescription("Name of tag").setRequired(true))
    ),
  async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
    const msg = await interaction.deferReply();
    let newMsg = STANDARD_ERROR_MSG;
    let channel: any = interaction.channel;
    if (!channel.nsfw && !SFW) {
      newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
    } else {
      // Checks to see which image board to search
      const subcommand = interaction.options.getSubcommand();
      const tag = interaction.options.getString("tag") ?? "azur_lane";
      let fetchObj: Danbooru | Yandere;
      if (subcommand === "quick" || interaction.options.getString("board") === "danbooru") {
        fetchObj = new Danbooru(tag);
      } else {
        fetchObj = new Yandere(tag);
      }
      // Check max allowed tags
      let allowed_tag_amount = fetchObj.maxTags;
      if (fetchObj instanceof Danbooru && fetchObj.sfw) {
        allowed_tag_amount -= 1;
      }

      if (fetchObj.containsBadTag(fetchObj.tag)) {
        newMsg = BAD_TAG_MSG;
      } else if (subcommand === "tag") {
        newMsg = await fetchObj.getTagSuggestions(fetchObj.tagList[0]);
      }
      else if (fetchObj.tagList.length > allowed_tag_amount) {
        newMsg = TOO_MANY_TAGS_MSG + allowed_tag_amount;
      } else {
        newMsg = await fetchObj.getPhoto();
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};