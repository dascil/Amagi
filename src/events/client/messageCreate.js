require("dotenv").config;
const prefix = process.env["PREFIX"];

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message, client) {
    if (!message.content.startsWith(prefix) || message.author.bot) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift().toLowerCase();

    if (!client.prefixCommands.has(command)) {
      return;
    }

    try {
		client.prefixCommands.get(command).execute(message, args, client);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
  },
};
