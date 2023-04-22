require("dotenv").config;
const prefix = process.env["PREFIX"]!;
import { Collection, Message } from "discord.js";
import AmagiClient from "../../client/AmagiClient";


module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message: Message, client: AmagiClient) {
    if (!message.content.startsWith(prefix) || message.author.bot) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift()!.toLowerCase();

    // Command does not exist
    if (!client.prefixCommands.has(command)) {
      return;
    }
    const commandParams = client.prefixCommands.get(command);

    // Checks if command has a cooldown object
    if (!client.prefixCooldowns.has(commandParams.name)) {
      client.prefixCooldowns.set(commandParams.name, new Collection());
    }

    // Get time and cooldown parameters
    const now = Date.now();
    const timestamps = client.prefixCooldowns.get(commandParams.name)!;
    const defaultCooldownDuration = 5;
    const cooldownAmount =
      (commandParams.cooldown ?? defaultCooldownDuration) * 1000;

    // Current cooldown exists for user of that command
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

      // Existing cooldown is found
      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return message
          .reply({
            content: `Please wait, you are on a cooldown for \`${commandParams.name}\`. You can use it again <t:${expiredTimestamp}:R>.`
          })
          .then((reply) => {
            setTimeout(() => reply.delete(), 5000);
          }).catch((error) => {
            console.error(error);
            message.reply("There was an error trying to execute that command!");
          });
      }
    }

    // Set cooldown and timer to remove cooldown
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      client.prefixCommands.get(command).execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply("There was an error trying to execute that command!");
    }
  },
};
