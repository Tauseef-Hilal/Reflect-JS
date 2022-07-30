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


export class Bot extends Client {
    constructor(...args) {
        super(...args);

        // Add event listeners
        this.addListener("ready", this.on_ready);
        this.addListener("messageCreate", this.on_message);
        this.addListener("interactionCreate", this.on_interaction_create);

        // Add commands
        this._commands = new Collection();

        // --
        this.maintenanceMode = false;
    }

    /**
     * Called when the bot logs in
     */
    async on_ready() {
        // Show success msg
        console.log(`Logged in as ${this.user.username}`);

        // Instantiate EmojiGroup
        this.emojiGroup = new EmojiGroup(this);

        // Setup Maintenance channel
        this.maintenanceChannel = await this.channels
            .fetch(MAINTENANCE_CHANNEL_ID);
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
     * Called when an application command is used
     * @param {CommandInteraction} interaction 
     */
    async on_command_invoke(interaction) {
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
    async on_modal_submit(interaction) {
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
    async on_interaction_create(interaction) {
        if (interaction.type == InteractionType.ModalSubmit) {
            this.on_modal_submit(interaction)
        }
        else if (interaction.type == InteractionType.ApplicationCommand) {
            this.commandHandler(this.on_command_invoke, interaction)
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
     * 
     * @param {Cog} commandGroup 
     */
    addCog(commandGroup) {
        for (let command of commandGroup) {
            console.log(command);
            this._commands.set(command, commandGroup[command]);
        }
    }

}