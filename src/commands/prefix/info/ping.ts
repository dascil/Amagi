import { Message } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";

module.exports = {
    name: "ping",
    description: "Return bot's ping",
    usage: "ping",
    return: "Returns the user's ping to bot.",
    cooldown: 5,
    async execute(message: Message, args: Array<string>, client: AmagiClient) {
        const newMsg = `Bot Latency: ${client.ws.ping}ms`;
        message.reply({
            content: newMsg,
        });
    },
};