module.exports = {
	name: "ping",
    cooldown: 5,
	description: "Return bot's ping",
	async execute(message, args, client) {
        const newMsg = `Bot Latency: ${client.ws.ping}ms`;
        message.reply({
            content: newMsg,
        });
    },
};