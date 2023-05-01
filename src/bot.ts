import AmagiClient from "./instances/classes/client/AmagiClient";
import { readdirSync } from "fs";
import { connect } from "mongoose";
require("dotenv").config();

const token: string = process.env['TOKEN']!;
const dbToken: string = process.env['DB_TOKEN']!;

// Create new client
const client = new AmagiClient();

if (client.debugMode) {
  console.log(client.debug("=== DEBUG MODE ACTIVATED ==="));
}
// Get all handler script files and initialize all functions
readdirSync("./build/functions").forEach((folder) => {
  const folderFiles = readdirSync(`./build/functions/${folder}`).filter((file) => file.endsWith(".js"));
  folderFiles.forEach((file) => { require(`./functions/${folder}/${file}`)(client); });
});

// Establish connection to server
client.login(token);

// Establish connection to database server
(async () => {
  await connect(dbToken).catch(error => {
    console.log(client.failure("[ERROR] ") + "Unable to log in to database.");
    console.error(error);
  });
});