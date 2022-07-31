import {
    SlashCommandBuilder,
    CommandInteraction,
    EmbedBuilder,
    Colors,
} from "discord.js";

import { Cog } from "../utils/cog.js";
import { OWNER_ID } from "../utils/constants.js";

export class MiscellaneousCommands extends Cog {

    ["toggle-maintenance-mode"] = {
        data: new SlashCommandBuilder()
            .setName("toggle-maintenance-mode")
            .setDescription("Turn maintenance mode on or off"),

        /**
         * Turn maintenance mode on or off
         * @param {CommandInteraction} interaction 
         */
        async execute(interaction) {

            // Check if owner
            if (interaction.user.id != OWNER_ID) {
                const emoji = this.emojiGroup.getEmoji("red_cross");

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Permission Error ${emoji}`)
                            .setDescription(
                                `You do not have the required permissions ` +
                                `to run this command.`
                            )
                            .setColor(Colors.Red)
                    ]
                });

                // Delete reply
                setTimeout(async () => await interaction.deleteReply(), 4000);
                return;
            }

            // Respond with an embed and toggle maintenance mode
            let emoji = this.emojiGroup.getEmoji("loading_dots");

            if (this.maintenanceMode) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `Disabling maintenance mode ${emoji}`
                            )
                            .setColor(Colors.Gold)
                    ]
                })

                // Change presence
                await this.user.setPresence({
                    activities: [{ name: "Tomorrowland 22" }], status: "online"
                });
            } else {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(
                            `Enabling maintenance mode ${emoji}`
                            )
                            .setColor(Colors.Gold)
                        ]
                    })
                    
                }
                
                // Toggle maintenance mode
                this.maintenanceMode = !this.maintenanceMode
                
                // Change presence
                await this.user.setPresence({
                    activities: [{ name: "Under Maintenance" }], status: "dnd"
                });
            // Show success
            emoji = this.emojiGroup.getEmoji("green_tick")

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Toggled maintenance mode ${emoji}`)
                        .setColor(Colors.Gold)
                ]
            })

            // Delete reply
            setTimeout(async () => await interaction.deleteReply(), 4000);
        }
    }

}