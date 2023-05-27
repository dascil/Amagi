import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { PrefixCommand, SlashCommand } from "../../interfaces/client/CommandInterface";
import chalk from "chalk";
import BooruHub from "../slash/fetch/BooruHub";

export default class AmagiClient extends Client {

    // Create collections
    public slashCommands: Collection<string, SlashCommand>;
    public prefixCommands: Collection<string, PrefixCommand>;
    public cooldowns: Collection<string, Collection<string, number>>;
    public prefixCooldowns: Collection<string, Collection<string, number>>;
    // Add colors for console messages
    public success: chalk.Chalk;
    public warning: chalk.Chalk;
    public failure: chalk.Chalk;
    public debug: chalk.Chalk;

    public debugMode: Boolean;
    public booru: BooruHub;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent,
            ],

            partials: [Partials.Channel]
        });
        this.debugMode = process.argv.length === 3 && process.argv[2] === "debug"? true : false;
        this.success = chalk.green;
        this.warning = chalk.yellow;
        this.failure = chalk.red;
        this.debug = chalk.magenta;
        this.slashCommands = new Collection();
        this.prefixCommands = new Collection();
        this.cooldowns = new Collection();
        this.prefixCooldowns = new Collection();
        this.booru = new BooruHub()
    }
}