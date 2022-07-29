import { SlashCommandBuilder, CommandInteraction, Colors, EmbedBuilder } from "discord.js";
import { Cog } from "../utils/cog.js";

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
}