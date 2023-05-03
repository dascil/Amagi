import { Guild } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import GuildModel from "../../schemas/guild"

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild, client: AmagiClient) {
        const id = guild.id;
        // Add new guild to database with default configurations
        const newGuild= new GuildModel({guildID: id});
        try {
            // Adds the guild to the database if the guild does not exist
            const existing = await GuildModel.findOne({guildID: id});
            if (!existing) {
                await newGuild.save();
            }
        } catch (error) {
            console.log(client.failure("[ERROR] ") + "There was a problem during the guildCreate event.");
            console.error(error);
        }
    }
}