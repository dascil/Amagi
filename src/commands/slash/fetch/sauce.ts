import { CacheType, ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BAD_TAG_MSG, NOT_IN_A_NSFW_CHANNEL_MSG, STANDARD_ERROR_MSG, TOO_MANY_TAGS_MSG } from "../../../json/slash/fetch/fetchErrors.json";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
import Board from "../../../instances/interfaces/slash/fetch/BoardInterface";
import BOARDS from "../../../instances/objects/slash/fetch/ImageBoards";

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
      .addStringOption((option) => option.setName("board").setDescription("Board to look tag up on").setRequired(true).addChoices({ name: 'Danbooru', value: "danbooru" }, { name: "Gelbooru", value: "gelbooru" }, { name: "Yandere", value: "yandere" }))
      .addStringOption((option) => option.setName("tag").setDescription("Name of tag").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName('tag')
      .setDescription("Get tag suggestions on selected board. Ignores input after first space.")
      .addStringOption((option) => option.setName("board").setDescription("Board to look tag up on").setRequired(true).addChoices({ name: 'Danbooru', value: "danbooru" }, { name: "Gelbooru", value: "gelbooru" }, { name: "Yandere", value: "yandere" }))
      .addStringOption((option) => option.setName("tag").setDescription("Name of tag").setRequired(true))
    ),
  usage: "sauce {command}",
  return: "Below is a list of the sauce commands:\n\n \
           `detailed`\n \
           Retrieve photo from specified image board based on tags\n \
           **Parameters:** `board` **Required:** True, `tag` **Required:** True \n\n \
           `quick`\n \
           Retrieve a photo from Danbooru based on tags.\n \
           **Parameters:** `tag` **Required:** False **Default:** `azur_lane`\n\n \
           `tag`\n \
           Retrieve list of suggested tags for a tag on the specified image board \n \
           **Parameters:** `board` **Required:** True, `tag` **Required:** True",
  async execute(interaction: ChatInputCommandInteraction<CacheType>, client: AmagiClient) {
    const msg = await interaction.deferReply();
    let newMsg = STANDARD_ERROR_MSG;
    // Interaction will always come from a channel
    const channel = interaction.channel!;
    if (channel.type === ChannelType.GuildText) {
      const fetch = client.fetch;
      if (!channel.nsfw && !fetch.sfw) {
        newMsg = NOT_IN_A_NSFW_CHANNEL_MSG;
      } else {
        // Retrieve information
        const subcommand = interaction.options.getSubcommand();
        const boardName = interaction.options.getString("board");
        let tag = interaction.options.getString("tag") ?? "azur_lane";
        let board: Board;
        // Checks to see which command to call
        if (subcommand === "quick" || boardName === "danbooru") {
          board = BOARDS.DANBOORU;
        } else if (boardName === "gelbooru") {
          board = BOARDS.GELBOORU
        } else {
          board = BOARDS.YANDERE;
        }
        // Check max allowed tags
        let allowed_tag_amount = fetch.maxTags;
        if (board.name === "danbooru" && fetch.sfw) {
          allowed_tag_amount = 1;
        }
        // Prep tags for usage
        tag = fetch.filterTag(tag);
        const tagList = fetch.getTagList(tag);
        // Looks for disallowed terms
        if (tag.length === 0 || fetch.containsBadTag(tag)) {
          newMsg = BAD_TAG_MSG;
        } else if (subcommand === "tag") {
          newMsg = await fetch.getTagSuggestions(tagList[0], board);
        }
        else if (tagList.length > allowed_tag_amount) {
          newMsg = TOO_MANY_TAGS_MSG + allowed_tag_amount;
        } else {
          newMsg = await fetch.getPhoto(tag, tagList, board);
        }
      }
    }
    // Sends reply to user
    await interaction.editReply({
      content: newMsg,
    });
  },
};