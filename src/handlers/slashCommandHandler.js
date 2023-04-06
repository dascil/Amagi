const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const { readdirSync } = require("fs");
require("dotenv").config();

const { guild_id, client_id, token } = process.env;

module.exports = async (client) => {
  try {
    commandArray = [];

    readdirSync("./src/commands/slash").forEach((folder) => {
      // Get all slash script files in slash subdirectory
      const slashFiles = readdirSync(`./src/commands/slash/${folder}`).filter(
        (file) => file.endsWith(".js")
      );

      const { slashCommands } = client;

      // Prepare commands to be passed into server
      slashFiles.forEach((file) => {
        const command = require(`../commands/slash/${folder}/${file}`);
        slashCommands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        console.log(`Command: ${command.data.name} has been passed.`);
      });
    });

    const clientID = client_id;
    const guildID = guild_id;
    const rest = new REST({ version: "10" }).setToken(token);

    // Pass commands into server
    console.log("Started refreshing application (/) commands.");
    rest
      .put(Routes.applicationGuildCommands(clientID, guildID), {
        body: commandArray,
      })
      .then(console.log("Successfully reloaded application (/) commands."));
  } catch (error) {
    console.log("Failed to load slash commands. See error below.");
    console.error(error);
  }
};
