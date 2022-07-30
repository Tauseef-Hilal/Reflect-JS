import { EmbedBuilder } from "@discordjs/builders";
import {
    Client,
    Colors,
    Message,
    Collection,
    BaseInteraction,
    InteractionType,
    CommandInteraction,
    ModalSubmitInteraction
} from "discord.js";

import { Cog } from "./utils/cog.js";
import { MAINTENANCE_CHANNEL_ID } from "./utils/constants.js";
import { botHasPermissions, botUnderMaintenance } from "./utils/checks.js";
import { EmojiGroup } from "./utils/emoji.js";


// JUST PUT THIS HERE :|
/**
 * Count the number of occurences of a substring
 * @param {Any} item 
 * @returns {Number}
 */
Array.prototype.count = function (item) {
    let counter = 0;
    let pos = -1;
    while (~(pos = this.indexOf(item, pos + 1))) {
        ++counter;
    }

    return counter;
}

/**
 * Count the number of occurences of a substring
 * @param {String} str 
 * @returns {Number}
 */
String.prototype.count = function (str) {
    let counter = 0;
    let pos = -1;
    while (~(pos = this.indexOf(str, pos + 1))) {
        ++counter;
    }

    return counter;
}


export class Bot extends Client {
    constructor(...args) {
        super(...args);

        // Add event listeners
        this.addListener("ready", this.onReady);
        this.addListener("messageCreate", this.onMessage);
        this.addListener("interactionCreate", this.onInteractionCreate);
        this.addListener("emojiCreate", this.onEmojiEvent);
        this.addListener("emojiDelete", this.onEmojiEvent);
        this.addListener("emojiUpdate", this.onEmojiEvent);

        // Add commands
        this._commands = new Collection();

        // --
        this.maintenanceMode = false;
    }

    /**
     * Called when the bot logs in
     */
    async onReady() {
        // Show success msg
        console.log(`Logged in as ${this.user.username}`);

        // Instantiate EmojiGroup
        this.emojiGroup = new EmojiGroup(this);

        // Setup Maintenance channel
        this.maintenanceChannel = await this.channels
            .fetch(MAINTENANCE_CHANNEL_ID);
    }

    /**
     * Called when en Emoji event is fired
     */
    onEmojiEvent() {
        this.emojiGroup._updateEmojis();
    }

    /**
     * Called when a message is sent in the server
     * 
     * @param {Message} message - Message created
     */
    async onMessage(message) {

        // AEWN: Animated Emojis Without Nitro
        if (message.content.count(":") > 1 && !message.webhookId) {
            this._animatedEmojis(message);
        }

    }

    /**
     * 
     * @param {Message} message 
     */
    async _animatedEmojis(message) {
        let emoji;
        let processedCount = 0;
        // Insert space between two :: and ><
        let msg = message.content
        while (msg.includes("::")) {
            msg = msg.replaceAll("::", ": :")
        }

        while (msg.includes("><")) {
            msg = msg.replaceAll("><", "> <")
        }

        // Remove codeblocks from message
        let codeblocks = new Set();
        for (let item of msg.matchAll(/(`{1,3}.+?`{1,3})+/gs)) {
            codeblocks.add(item[0]);
        }

        const BLOCK_ID_FORMAT = "<CodeBlock => @Index: {i}>";

        let idx = 0;
        for (let block of codeblocks) {
            if (block.split("`").count("") % 2 != 0) continue;

            // Substitute codeblock
            msg = msg.replaceAll(block, BLOCK_ID_FORMAT.replaceAll("{i}", idx++));
        }

        // Search for emojis
        let emojis = new Set();
        for (let item of msg.matchAll(/(:[\w\-~]*:)+/g)) {
            emojis.add(item[0]);
        }

        let processedEmojis = new Map();
        for (let emoji of msg.matchAll(/(<a?:\w+:\d+>)+/g)) {
            processedEmojis.set(`:${emoji[0].split(":")[1]}:`, true)
        }

        // Return if all emojis are already processed
        if (emojis.size - processedEmojis.size == 0) return;

        for (let word of emojis) {
            // Skip if already processed
            if (processedEmojis.has(word)) continue;

            // Get emoji
            emoji = this.emojiGroup.getEmoji(
                word.slice(1, -1),
                message.guild.id
            )

            // Skip if not a valid emoji
            if (!emoji) continue;

            // Replace the word by its emoji
            msg = msg.replaceAll(word, emoji.toString());
            ++processedCount;
        }

        // Return for no emoji
        if (!processedCount) return;

        // Add codeblocks back to the message
        idx = 0;
        for (let block of codeblocks) {
            msg = msg.replaceAll(
                BLOCK_ID_FORMAT.replaceAll("{i}", idx++),
                block
            );
        }

        // Send webhook
        try {
            await this._sendWebhook(message, msg)

            // Delete the original msg
            await message.delete()

        } catch (err) {
            console.error(err)
            return;
        }

    }

    /**
     * Send webhook
     * @param {Message} message Original message
     * @param {String} mod_msg Modifies message content
     */
    async _sendWebhook(message, mod_msg = "") {

        // Get all webhooks currently in the msg channel
        let webhooks = await message.channel.fetchWebhooks();

        // Check if there exists a webhook with id
        // equal to bot's id. In that case, break
        let webhook;
        for (webhook of webhooks.values()) {
            if (webhook.owner.id == this.user.id) {
                break;
            }
            webhook = null;
        }

        // Otherwise
        if (!webhook) {
            // Create a new webhook for the channel
            webhook = await message.channel.createWebhook({
                name: "Reflect-JS",
                avatar: this.user.avatarURL(),
                reason: "Animated Emojis: Free Usage",
            })
        }

        // Send webhook to the channel with username as the name
        // of msg author and avatar as msg author's avatar
        await webhook.send({
            content: mod_msg ? mod_msg : message.content,
            username: message.author.username,
            avatarURL: message.author.avatarURL()
        });
    }

    /**
     * Called when an application command is used
     * @param {CommandInteraction} interaction 
     */
    async onCommandInvoke(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this._commands.get(interaction.commandName);
        if (command) {
            await command.execute(interaction);
        }
    }

    /**
     * Called when a user submit a modal
     * @param {ModalSubmitInteraction} interaction 
     */
    async onModalSubmit(interaction) {
        // Get the data entered by the user
        const title = interaction.fields.getTextInputValue("embedTitle");
        const desc = interaction.fields.getTextInputValue("embedDescription");
        const thumb = interaction.fields.getTextInputValue("embedThumbnail");
        const footer = interaction.fields.getTextInputValue("embedFooter");

        // Create embed
        let embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(Colors.Gold)
            .setDescription(desc)
            .setTimestamp();

        if (thumb) {
            embed = embed.setThumbnail(thumb);
        }

        if (footer) {
            embed = embed.setFooter({
                text: footer,
                iconURL: interaction.user.avatarURL()
            });
        }


        // Send embed
        await interaction.reply({ embeds: [embed] });
    }

    /**
     * Called when an interaction is created
     * @param {BaseInteraction} interaction 
     * @returns 
     */
    async onInteractionCreate(interaction) {
        if (interaction.type == InteractionType.ModalSubmit) {
            this.onModalSubmit(interaction)
        }
        else if (interaction.type == InteractionType.ApplicationCommand) {
            this.commandHandler(this.onCommandInvoke, interaction)
        }
    }

    /**
     * Check for maintenance and permissions
     * @param {Function} func - Command execution function
     * @param {CommandInteraction} interaction - Command interaction
     */
    async commandHandler(func, interaction) {
        // Check for maintenance mode
        if (await botUnderMaintenance.call(this, interaction)) return;

        // Check for bot permissions
        if (!await botHasPermissions.call(this, interaction)) return;

        // Execute command
        return func.call(this, interaction);
    }

    /**
     * @param {Cog} commandGroup 
     */
    addCog(commandGroup) {
        for (let command of commandGroup) {
            console.log(command);
            this._commands.set(command, commandGroup[command]);
        }
    }

}