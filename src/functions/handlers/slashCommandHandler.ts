import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";
import { readdirSync } from "fs";
import AmagiClient from "../../instances/classes/client/AmagiClient";
require("dotenv").config();

const client_id: string = process.env["CLIENT_ID"]!;
const token: string = process.env["TOKEN"]!;

module.exports = async (client: AmagiClient) => {
  try {
    let commandArray: Object[] = [];
    if (client.debugMode) {
      console.log(client.debug("DEBUG: ") + "Begin loading slash commands...");
    }
    readdirSync("./built/commands/slash").forEach((folder) => {
      // Get all slash script files in slash subdirectory
      const slashFiles = readdirSync(`./built/commands/slash/${folder}`).filter(
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
    const rest = new REST({ version: "10" }).setToken(token);

    // Pass commands into server
    await rest.put(Routes.applicationCommands(clientID), {
      body: commandArray,
    })

    console.log(client.success("SUCCESS: ") + "Successfully loaded slash commands.");

  } catch (error) {
    console.log(
      client.failure("ERROR: ") +
      "Failed to load slash commands. See error below."
    );
    console.error(error);
  }
};
