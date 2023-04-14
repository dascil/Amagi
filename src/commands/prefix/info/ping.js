module.exports = {
	name: "ping",
	description: "Return bot's ping",
	async execute(message, args, client) {
        const newMsg = `Bot Latency: ${client.ws.ping}ms`;
        message.reply({
            content: newMsg,
        });
    },
};