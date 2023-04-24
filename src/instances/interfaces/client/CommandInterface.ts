import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../classes/client/AmagiClient";

export interface PrefixCommand {
    name: string,
    description: string,
    cooldown?: number,
    execute(message: Message, args: Array<string>, client: AmagiClient): Promise<void>
}

export interface SlashCommand {
    data: SlashCommandBuilder,
    cooldown?: number,
    execute(interaction: ChatInputCommandInteraction, client: AmagiClient): Promise<void>
}
