import { Client, Collection, GatewayIntentBits } from "discord.js";
import chalk, { ChalkInstance } from "chalk";
import { DEBUG } from "../json/config.json";

class AmagiClient extends Client {

    // Create collections
    public slashCommands: Collection<string, any>;
    public prefixCommands: Collection<string, any>;
    public cooldowns: Collection<string, Collection<string, Number>>;
    public prefixCooldowns: Collection<string, Collection<string, Number>>;
    // Add colors for console messages
    public success: ChalkInstance;
    public warning: ChalkInstance;
    public failure: ChalkInstance;
    public debug: ChalkInstance;

    public debugMode: Boolean;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent,
            ],
        });
        this.debugMode = DEBUG;
        this.success = chalk.green;
        this.warning = chalk.yellow;
        this.failure = chalk.red;
        this.debug = chalk.magenta;
        this.slashCommands = new Collection();
        this.prefixCommands = new Collection();
        this.cooldowns = new Collection();
        this.prefixCooldowns = new Collection();
    }
}

export default AmagiClient;