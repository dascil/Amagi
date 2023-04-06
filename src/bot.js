const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");

require("dotenv").config();
const { token } = process.env;

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

// Get all handler script files and initialize all functions
const handlerFiles = readdirSync("./src/handlers").filter((file) =>
  file.endsWith(".js")
);
handlerFiles.forEach((file) => require(`./handlers/${file}`)(client));

// Establish connection to server
client.login(token);
