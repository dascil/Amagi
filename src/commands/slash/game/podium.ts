import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
const react1 = process.env['123']!;
const react2 = process.env['132']!;
const react3 = process.env['213']!;
const react4 = process.env['231']!;
const react5 = process.env['312']!;
const react6 = process.env['321']!;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('podium')
        .setDescription('Rate the characters in the photo 1 (highest) to 3 (lowest)')
        .addSubcommand(command => command
            .setName("link")
            .setDescription("Podium game using photo link")
            .addStringOption(option => option
                .setName("link")
                .setDescription("Link to photo")
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName("attachment")
            .setDescription("Podium game using attached photo")
            .addAttachmentOption(option => option
                .setName("attachment")
                .setDescription("Photo to be attached")
                .setRequired(true)
            )
        ),
    usage: "podium {subcommand}",
    return: "Below is a list of the podium commands: \n\n \
             `link`\n \
             Reacts with podium emotes to linked photo\n \
             **Parameters:** `link` **Required:** True \n\n \
             `attachment`\n \
             Reacts with podium emotes to attached photo\n \
             **Parameters:** `attachment` **Required:** True",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();

        let newMsg = null;
        const subcommand = interaction.options.getSubcommand();
        let photoGood = true;

        if (subcommand === "link") {
            // Checks if valid URL to an image is passed
            const link = interaction.options.getString("link")!;
            try {
                let url = new URL(link);
            } catch (error) {
                photoGood = false;
            }
            if (
                photoGood && (link.endsWith(".png") ||
                    link.endsWith(".jpeg") ||
                    link.endsWith(".jpg") ||
                    link.endsWith(".webp"))
            ) {
                newMsg = link;
            } else {
                newMsg = "URL is not valid. \nMake sure sure the image linked is a jpg, jpeg, png, or webp.";
                photoGood = false;
            }
        } else {
            // Checks if an image with valid dimensions is passed
            const attachment = interaction.options.getAttachment("attachment");
            const link = attachment?.url;

            if (attachment?.contentType?.startsWith("image") && attachment.height !== null && attachment.width !== null) {
                newMsg = link;
            } else {
                newMsg = "Attachment is not valid. \nMake sure sure the image uploaded is a jpg, jpeg, png, or webp."
                photoGood = false;
            }
        }

        await interaction.editReply({
            content: newMsg
        }).then(message => {
            if (photoGood) {
                message.react(react1);
                message.react(react2);
                message.react(react3);
                message.react(react4);
                message.react(react5);
                message.react(react6);
            }
        }).catch(error => {
            console.log(client.failure("ERROR: Problem adding reactions to podium command"));
            console.error(error);
        });
    },
};