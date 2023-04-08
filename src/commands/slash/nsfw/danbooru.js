const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("danbooru")
    .setDescription(
      "Gives random danbooru image of specified tag. Default tag is azur_lane"
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

    const RETRIES = 3;
    const NOT_FOUND_PROMISE = "That record was not found.";
    // Expected errors that can occur
    const SITE_UNREACHABLE_MSG =
      "Unable to reach Danbooru.\nPlease check if Danbooru is going through maintanence or is down.";
    const BAD_TAG_MSG =
      "Tag does not exist on danbooru.\n Please make sure your spelling is correct.";
    const NO_SUITABLE_PHOTO_MSG =
      "Unable to find a suitable photo with that tag.\nPlease try again.";
    // A new error has occured and needs to be investigated
    let newMsg =
      "An error has occured.\nPlease contact an admin and describe what happened.";

    try {
      // Get tag or use default
      const tag = interaction.options.getString("tag") ?? "azur_lane";
      let url = "https://danbooru.donmai.us/posts/random.json?tags=" + tag;
      let jsonObj = null;
      // If fetch requests fails due to bad image,
      // it will retry a set amount of times before
      // giving up and sending an error
      for (let i = 0; i < RETRIES; i++) {
        // Fetch request Danbooru API
        jsonObj = await fetch(url);
        // If error during fetch request
        if (!jsonObj.ok) {
          newMsg = SITE_UNREACHABLE_MSG;
          let error = await jsonObj.json();
          // Bad tag error
          if (
            error.hasOwnProperty("message") &&
            error.message === NOT_FOUND_PROMISE
          ) {
            newMsg = BAD_TAG_MSG;
            throw new Error(error.message);
            // Danbooru site error
          } else {
            throw new Error(await jsonObj.text());
          }
        }
        jsonObj = await jsonObj.json();
        // Valid photo found with correct format
        if (
          jsonObj.hasOwnProperty("file_url") &&
          (jsonObj.file_url.endsWith(".png") ||
            jsonObj.file_url.endsWith(".jpg") ||
            jsonObj.file_url.endsWith(".webp"))
        ) {
          break;
        }
      }
      // Null edge case catch
      if (jsonObj === null) {
        console.trace();
        throw new Error("jsonObj is null.");
      }
      // Still cannot find a suitable photo after retries
      if (
        !jsonObj.hasOwnProperty("file_url") || (
        !jsonObj.file_url.endsWith(".jpg") &&
        !jsonObj.file_url.endsWith(".png") &&
        !jsonObj.file_url.endsWith(".webm"))
      ) {
        newMsg = NO_SUITABLE_PHOTO_MSG;
        throw new Error(await jsonObj.text());
      }
      // Send picture
      newMsg = jsonObj.file_url;
      // Logs any error that occured
    } catch (error) {
      const time = new Date().toLocaleTimeString();
      console.error("\nTIME OF ERROR: " + time);
      console.error("/Danbooru command");
      console.error(error);


      // Sends reply to user
    } finally {
      await interaction.editReply({
        content: newMsg,
      });
    }
  },
};
