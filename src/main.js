import { GatewayIntentBits as Intents, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import * as dotenv from 'dotenv'

// ---
import { Bot } from "./bot.js";
import { GeneralCommands } from "./commands/general.js";
import { MiscellaneousCommands } from "./commands/miscellaneous.js";
import { ICODE_GUILD_ID } from "./utils/constants.js";

// Load environment variables
dotenv.config()


/**
 * Instantiate client and login
 */
export async function main() {

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
    const BOT = new Bot({ intents: INTENTS });
    await BOT.login(process.env.BOT_TOKEN);

    // Add commands
    BOT.addCog(new GeneralCommands(BOT));
    BOT.addCog(new MiscellaneousCommands(BOT));

    const commands = Array.from(
        BOT._commands.values()
    ).map(command => command.data.toJSON());

    // REST
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                ICODE_GUILD_ID
            ),
            { body: commands }
        );
    } catch (err) {
        console.error(err);
    }

}

