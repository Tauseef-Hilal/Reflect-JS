import { GuildEmoji } from "discord.js";
import { Bot } from "../bot.js";


export class EmojiGroup {
    /**
     * @param {Bot} client 
     */
    constructor(client) {
        this._bot = client;

        for (let emoji of this._bot.emojis.cache.values()) {
            let i = 0;
            let name = emoji.name;
            while (name in this) {
                name = name.split("-")[0] + `-${++i}`;
            }
            this[name] = emoji;
        }
    }

    /**
     * Get emoji by name
     * @param {String} name - Emoji name
     * @returns {GuildEmoji | undefined}, undefined if not found
     */
    getEmoji(name) {
        return this[name];
    }
}