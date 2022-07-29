import { EmbedBuilder } from "@discordjs/builders";
import { Client, Colors, Message } from "discord.js";

export class Reflect extends Client {
    constructor(...args) {
        super(...args);

        // Add event listeners
        this.addListener("ready", this.on_ready);
        this.addListener("messageCreate", this.on_message);
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
    on_message(message) {
        if (!message.content.startsWith("echo") && !message.webhookId) return;

        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Reflection Of Love`)
                    .setDescription(`Your message: ${message.content.replace("echo", "")}`)
                    .setColor(Colors.Aqua)
            ]
        }).then(() => console.log("Embed sent!"));
    }

}