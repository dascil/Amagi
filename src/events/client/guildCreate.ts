import { Guild } from "discord.js";
import AmagiClient from "../../instances/classes/client/AmagiClient";
import GuildModel from "../../schemas/guild"

module.exports = {
    name: "guildCreate",
    once: false,
    async execute(guild: Guild, client: AmagiClient) {
        const id = guild.id;
        try {
            const query = await GuildModel.findOneAndUpdate({guildID: id}, {$setOnInsert: {guildID: id}}, { upsert: true, new: true, setDefaultsOnInsert: true });
            if (!query) {
              throw new Error("No query returned in guildcreate event.");
            }
        } catch (error) {
            console.log(client.failure("[ERROR] ") + "There was a problem during the guildCreate event.");
            console.error(error);
        }
    }
}