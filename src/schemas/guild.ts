import {Schema, model} from "mongoose"

const guildSchema = new Schema({
    _id: Schema.Types.ObjectId,
    guildID: String,
    prefix: { type: String, default:"!"},
    sfw: { type: Boolean, default: false },
    trustUser: { type: Boolean, default: false},
});

export default model("Guild", guildSchema, "guilds");