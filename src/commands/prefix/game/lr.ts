import { Message } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
const react1 = process.env['L']!;
const react2 = process.env['R']!;

module.exports = {
    name: "lr",
    description: "Reacts with lr emotes to attached photo",
    usage: "lr",
    return: "Returns lr emote reactions to photo.\n**Requires:** A photo with extension png, jpg, jpeg, or webp.",
    cooldown: 10,
    async execute(message: Message, args: Array<string>, client: AmagiClient) {
        if (message.attachments.size >= 1) {
            const attachment = message.attachments.first()

            if (attachment?.contentType?.startsWith("image") && attachment.height !== null && attachment.width !== null) {
                message.react(react1);
                message.react(react2);
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