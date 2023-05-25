import { Guild } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import GuildModel from "../../schemas/guild"

module.exports = {
    name: "guildDelete",
    once: false,
    async execute(guild: Guild, client: AmagiClient) {
        // Deletes guild from database upon guild removing bot from server
        try {
            await GuildModel.deleteOne({guildID: guild.id});
        } catch (error) {
            console.log(client.failure("[ERROR] ") + "There was a problem during the guildDelete event.");
            console.error(error);
        }
    }
}