import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../../instances/classes/client/AmagiClient";

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
            .addStringOption(option => option
                .setName("attachment")
                .setDescription("Photo to be attached")
                .setRequired(true)
            )
        ),
    usage: "podium {subcommand}",
    return: "Below is al ist of the sauce commands: \n\n \
             `link`\n \
             Reacts with podium emotes to linked photo\n \
             **Parameters:** `link` **Required:** True \n \
             `attachment`\n \
             Reacts with podium emotes to attached photo\n \
             **Parameters:** `attachment` **Required:** True \n",
    async execute(interaction: ChatInputCommandInteraction, client: AmagiClient) {
        await interaction.deferReply();
        
        let newMsg = null;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === "link") {
            const link = interaction.options.getString("link");

            newMsg = "Test";
        } else {
            const attachment = interaction.options.getAttachment("attachment");

            newMsg = "Test";
        }

        await interaction.editReply({
            content: newMsg
        });
    },
};