import { Guild } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import GuildModel from "../../schemas/guild"

module.exports = {
    name: "guildDelete",
    once: false,
    async execute(guild: Guild, client: AmagiClient) {
        const id = guild.id;
        // Add new guild to database with default configurations
        try {
            // Adds the guild to the database if the guild does not exist
            await GuildModel.deleteOne({guildID:id});
        } catch (error) {
            console.log(client.failure("[ERROR] ") + "There was a problem during the guildDelete event.");
            console.error(error);
        }
    }
}