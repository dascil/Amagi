import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from "discord.js";
import AmagiClient from "../../classes/client/AmagiClient";

export interface PrefixCommand {
    name: string,
    description: string,
    usage: string,
    return: string,
    cooldown?: number,
    execute(message: Message, args: Array<string>, client: AmagiClient): Promise<void>
}

export interface SlashCommand {
    data: SlashCommandBuilder,
    usage: string,
    return: string,
    cooldown?: number,
    execute(interaction: ChatInputCommandInteraction, client: AmagiClient): Promise<void>
}
