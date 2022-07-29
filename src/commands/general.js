import {
    SlashCommandBuilder,
    CommandInteraction,
    EmbedBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";


import { Cog } from "../utils/cog.js";


class EmbedModal extends ModalBuilder {
    constructor(...args) {
        super(...args);

        // ---
        this.setTitle("Embed Builder");
        this.setCustomId("embedModal");

        // Add components
        this.addComponents(
            new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setLabel("Embed Title")
                        .setPlaceholder("Embed Title")
                        .setCustomId("embedTitle")
                        .setStyle(TextInputStyle.Short)
                ),

            new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setLabel("Embed Description")
                        .setPlaceholder("Embed Description")
                        .setCustomId("embedDescription")
                        .setStyle(TextInputStyle.Paragraph)
                ),

            new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setLabel("Embed Thumbnail")
                        .setPlaceholder("Thumbnail URL")
                        .setCustomId("embedThumbnail")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                ),

            new ActionRowBuilder()
                .addComponents(
                    new TextInputBuilder()
                        .setLabel("Embed Footer")
                        .setPlaceholder("Footer Text")
                        .setCustomId("embedFooter")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )
        )
    }
}

export class GeneralCommands extends Cog {

    avatar = {
        data: new SlashCommandBuilder()
            .setName("avatar")
            .setDescription("Get a user's avatar")
            .addUserOption(option =>
                option.setName("user")
                    .setDescription(
                        "The user whose avatar you want to get."
                        + " Defaults to current user."
                    )
            ),

        /**
         * Get a user's avatar
         * @param {CommandInteraction} interaction 
         */
        async execute(interaction) {

            // Parse options
            let user = interaction.options.getUser("user");
            if (!user) {
                user = interaction.user;
            }

            const color = (
                await interaction.guild.members.fetch({ user })).displayColor;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: user.username,
                            iconURL: user.avatarURL()
                        })
                        .setImage(user.avatarURL({ size: 4096 }))
                        .setFooter({
                            text: interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setColor(color)
                        .setTimestamp()
                ]
            });
        }

    }

    embed = {
        data: new SlashCommandBuilder()
            .setName("embed")
            .setDescription("Create an embedded message"),

        /**
         * Create an embedded message
         * @param {CommandInteraction} interaction 
         */
        async execute(interaction) {
            await interaction.showModal(new EmbedModal());
        }
    }

    icon = {
        data: new SlashCommandBuilder()
            .setName("icon")
            .setDescription("Get server icon"),

        /**
         * Get server icon
         * @param {CommandInteraction} interaction 
         */
        async execute(interaction) {
            const color = (
                await interaction.guild.members.fetch({
                    user: interaction.user
                })).displayColor;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: interaction.guild.name,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setImage(interaction.guild.iconURL({ size: 4096 }))
                        .setFooter({
                            text: interaction.user.username,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setTimestamp()
                        .setColor(color)
                ]
            });
        }
    }

}