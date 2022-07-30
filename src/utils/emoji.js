import { Collection, GuildEmoji } from "discord.js";
import { Bot } from "../bot.js";


export class EmojiGroup {
    /**
     * @param {Bot} client 
     */
    constructor(client) {
        this._bot = client;
        this._updateEmojis()
    }

    /**
     * Get emoji by name
     * @param {String} name - Emoji name
     * @param {String} guildId - Guild ID
     * @returns {GuildEmoji | undefined}, undfined if not found
     */
    getEmoji(name, guildId) {
        if (this._emojis.has(guildId) && this._emojis.get(guildId).has(name)) {
            return this._emojis.get(guildId).get(name);
        }

        return Array
            .from(this._emojis.values())
            .filter(col => col.has(name))[0]
            ?.get(name)
    }

    /**
     * Update emojis
     */
    _updateEmojis() {
        this._emojis = new Collection();

        for (let emoji of this._bot.emojis.cache.values()) {
            if (!this._emojis.has(emoji.guild.id)) {
                this._emojis.set(emoji.guild.id, new Collection());
            }

            this._emojis.get(emoji.guild.id).set(emoji.name, emoji);
        }
    }
}