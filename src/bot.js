import { EmbedBuilder } from "@discordjs/builders";
import { Client, Collection, Colors, CommandInteraction, Message } from "discord.js";
import { Cog } from "./utils/cog.js";

export class Bot extends Client {
    constructor(...args) {
        super(...args);

        // Add event listeners
        this.addListener("ready", this.on_ready);
        this.addListener("messageCreate", this.on_message);
        this.addListener("interactionCreate", this.on_command_invoke);

        // Add commands
        this.commands = new Collection();
    }

    /**
     * Called when the bot logs in
     */
    on_ready() {

        console.log(`Logged in as ${this.user.username}`);
    }

    /**
     * Called when a message is sent in the server
     * 
     * @param {Message} message - Message created
     */
    async on_message(message) {
        return;
    }

    /**
     * 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    async on_command_invoke(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commands.get(interaction.commandName);
        if (command) {
            await command.execute(interaction);
        }
    }

    /**
     * 
     * @param {Cog} cog 
     */
    addCog(cog) {
        for (let property in cog) {
            if (property == "_client") continue;
            console.log(property);
            this.commands.set(property, cog[property]);
        }
    }

}