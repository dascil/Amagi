import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";
const react1 = process.env['L']!;
const react2 = process.env['R']!;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lr')
        .setDescription('Pick your favorite left (L) or right (R)')
        .addSubcommand(command => command
            .setName("link")
            .setDescription("LR game using photo link")
            .addStringOption(option => option
                .setName("link")
                .setDescription("Link to photo")
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName("attachment")
            .setDescription("LR game using attached photo")
            .addAttachmentOption(option => option
                .setName("attachment")
                .setDescription("Photo to be attached")
                .setRequired(true)
            )
        ),
    usage: "lr {subcommand}",
    return: "Below is a list of the lr commands: \n\n \
             `link`\n \
             Reacts with lr emotes to linked photo\n \
             **Parameters:** `link` **Required:** True \n \
             `attachment`\n \
             Reacts with lr emotes to attached photo\n \
             **Parameters:** `attachment` **Required:** True \n",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();

        let newMsg = null;
        const subcommand = interaction.options.getSubcommand();
        let photoGood = true;

        if (subcommand === "link") {
            const link = interaction.options.getString("link")!;
            // Verifies string link passed is a valid URL to an image
            try {
                new URL(link);
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
            // Check if the attachments are images with readable dimensions
            const attachment = interaction.options.getAttachment("attachment")!;
            const link = attachment.url ?? "";
            if (attachment.contentType?.startsWith("image") && attachment.height !== null && attachment.width !== null) {

                newMsg = link;

            } else {
                newMsg = "Attachment is not valid. \nMake sure sure the image uploaded is a jpg, jpeg, png, or webp."
                photoGood = false;
            }

        }

        // Reacts with LR emotes
        await interaction.editReply({
            content: newMsg
        }).then(message => {
            if (photoGood) {
                message.react(react1);
                message.react(react2);
            }
        }).catch(error => {
            console.log(client.failure("ERROR: Problem adding reactions to lr command"));
            console.error(error);
        });
    },
};