import {Schema, model} from "mongoose"
import { SFW, PREFIX, DENYLIST } from "../json/default.json"

const guildSchema = new Schema({
    guildID: { type: String, unique: true },
    prefix: { type: String, default: PREFIX},
    sfw: { type: Boolean, default: SFW },
    denyList: { type: Array<String>, default: DENYLIST}
});

export default model("Guild", guildSchema, "guilds");