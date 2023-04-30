import { Message } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
const react1 = process.env['123']!;
const react2 = process.env['132']!;
const react3 = process.env['213']!;
const react4 = process.env['231']!;
const react5 = process.env['312']!;
const react6 = process.env['321']!;

module.exports = {
    name: "podium",
    description: "Reacts with podium emotes to attached photo",
    usage: "podium",
    return: "Returns podium emote reactions to photo",
    cooldown: 10,
    async execute(message: Message, args: Array<string>, client: AmagiClient) {
        if (message.attachments.size >= 1) {
            const attachment = message.attachments.first()

            if (attachment?.contentType?.startsWith("image") && attachment.height !== null && attachment.width !== null) {
                message.react(react1);
                message.react(react2);
                message.react(react3);
                message.react(react4);
                message.react(react5);
                message.react(react6);
            } else {
                message.reply({
                    content: "Attachment is not valid. \nMake sure sure the image uploaded is a jpg, jpeg, png, or webp."
                }).then((reply) => {
                    setTimeout(() => reply.delete(), 5000);
                }).catch((error) => {
                    console.error(error);
                    message.reply("There was an error trying to execute that command!");
                });
            }
        }

    },
};