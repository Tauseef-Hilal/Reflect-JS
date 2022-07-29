import { GatewayIntentBits as Intents } from "discord.js";
import * as dotenv from 'dotenv'

// ---
import { Reflect } from "./bot.js";

// Load environment variables
dotenv.config()


/**
 * Instantiate client and login
 */
export function main() {

    // Configure Gateway Intents
    const INTENTS = [
        Intents.Guilds,
        Intents.GuildMembers,
        Intents.GuildPresences,
        Intents.GuildWebhooks,
        Intents.GuildIntegrations,
        Intents.GuildMessages,
        Intents.MessageContent,
        Intents.GuildMessageReactions,
        Intents.GuildEmojisAndStickers,
    ]

    // Instantiate Reflect
    const REFLECT = new Reflect({ intents: INTENTS });
    REFLECT.login(process.env.BOT_TOKEN);
}

