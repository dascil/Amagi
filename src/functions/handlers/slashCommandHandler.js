const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const { readdirSync } = require("fs");
require("dotenv").config();

const guild_id = process.env["GUILD_ID"];
const client_id = process.env["CLIENT_ID"];
const token = process.env["TOKEN"];

module.exports = async (client) => {
  try {
    commandArray = [];
    if (client.debugMode) {
      console.log(client.debug("DEBUG: ") + "Begin loading slash commands...");
    }
    readdirSync("./src/commands/slash").forEach((folder) => {
      // Get all slash script files in slash subdirectory
      const slashFiles = readdirSync(`./src/commands/slash/${folder}`).filter(
        (file) => file.endsWith(".js")
      );

      const { slashCommands } = client;

      // Prepare commands to be passed into server
      slashFiles.forEach((file) => {
        const command = require(`../../commands/slash/${folder}/${file}`);
        slashCommands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        if (client.debugMode) {
          console.log(client.debug("DEBUG: ") + `Slash command ${command.data.name} has been passed.`);
        }
      });
    });

    const clientID = client_id;
    const guildID = guild_id;
    const rest = new REST({ version: "10" }).setToken(token);

    // Pass commands into server
    rest
      .put(Routes.applicationGuildCommands(clientID, guildID), {
        body: commandArray,
      })
      .then(
        console.log(
          client.success("SUCCESS: ") +
            "Successfully loaded slash commands."
        )
      );
  } catch (error) {
    console.log(
      client.failure("ERROR: ") +
        "Failed to load slash commands. See error below."
    );
    console.error(error);
  }
};
