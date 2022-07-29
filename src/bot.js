import { EmbedBuilder } from "@discordjs/builders";
import { BaseInteraction, Client, Collection, Colors, CommandInteraction, InteractionType, Message, ModalSubmitInteraction } from "discord.js";
import { Cog } from "./utils/cog.js";

export class Bot extends Client {
    constructor(...args) {
        super(...args);

        // Add event listeners
        this.addListener("ready", this.on_ready);
        this.addListener("messageCreate", this.on_message);
        this.addListener("interactionCreate", this.on_interaction_create);

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
     * Called when an application command is used
     * @param {CommandInteraction} interaction 
     */
    async on_command_invoke(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commands.get(interaction.commandName);
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
        await interaction.reply({embeds: [embed]});
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
            this.on_command_invoke(interaction);
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