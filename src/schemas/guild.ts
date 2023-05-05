import {Schema, model} from "mongoose"

const guildSchema = new Schema({
    guildID: String,
    prefix: { type: String, default:"!"},
    sfw: { type: Boolean, default: false }
});

export default model("Guild", guildSchema, "guilds");