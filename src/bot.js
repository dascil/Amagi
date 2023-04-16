const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
require("dotenv").config();
const chalk = require("chalk");
const { DEBUG } = require("./json/config.json");
const token = process.env['TOKEN'];
// Create new client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});
// Create collections
client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.cooldowns = new Collection();
client.prefixCooldowns = new Collection();
// Add colors for console messages
client.debugMode = DEBUG;
client.success = chalk.green;
client.warning = chalk.yellow;
client.failure = chalk.red;
client.debug = chalk.magenta;
if (client.debugMode) {
  console.log(client.debug("=== DEBUG MODE ACTIVATED ==="));
}
// Get all handler script files and initialize all functions
readdirSync("./src/functions").forEach((folder) => {
  const folderFiles = readdirSync(`./src/functions/${folder}`).filter((file) => file.endsWith(".js"));
  folderFiles.forEach((file) => {require(`./functions/${folder}/${file}`)(client);});
});

// Establish connection to server
client.login(token);
