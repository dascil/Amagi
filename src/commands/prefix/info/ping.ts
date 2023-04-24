import { Message } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";

module.exports = {
    name: "ping",
    cooldown: 5,
    description: "Return bot's ping",
    async execute(message: Message, args: Array<string>, client: AmagiClient) {
        const newMsg = `Bot Latency: ${client.ws.ping}ms`;
        message.reply({
            content: newMsg,
        });
    },
};