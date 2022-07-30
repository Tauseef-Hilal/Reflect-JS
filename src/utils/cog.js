import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";

import { Bot } from "../bot.js";


export class Cog {
    /**
     * @param {Bot} client 
     */
    constructor(client) {
        this._bot = client;
    }

    [Symbol.iterator]() {
        let commands = Object.keys(this).filter(key => key != "_bot");

        return {
            currIdx: 0,
            lastIdx: commands.length,

            next() {
                return (this.currIdx < this.lastIdx)
                    ? { done: false, value: commands[this.currIdx++] }
                    : { done: true };
            }

        }
    }

}