import { Colors, CommandInteraction, EmbedBuilder } from "discord.js";

/**
 * Check for maintenance mode
 * @param {CommandInteraction} interaction 
 * @returns true if under maintenance mode
 */
export async function botUnderMaintenance(interaction) {
    if (
        this.maintenanceMode &&
        interaction.channel != this.maintenanceChannel
    ) {
        // Send embed
        const emoji = this.emojiGroup.getEmoji("warning");
        
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Maintenance Break ${emoji}`)
                    .setDescription(
                        `Reflect is under maintenance. Commands will ` +
                        `work only in \nthe ${this.maintenanceChannel}`
                        + `channel of iCODE server.`
                    )
                    .setColor(Colors.Gold)
            ]
        });

        // Delete reply
        setTimeout(async () => await interaction.deleteReply(), 4000);

        return true;
    }

    return false;
}

/**
 * Check for permissions
 * @param {CommandInteraction} interaction - Command Interaction
 */
export async function botHasPermissions(interaction) {
    // Get required perms
    const perms = this._commands.get(interaction.commandName).botPerms;
    if (!perms) return true;
    
    // Check bot permissions
    if (!interaction.guild.members.me.permissions.has(perms)) {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Permission Error")
                    .setDescription(
                        `I do not have the required permissions ` +
                        `to run this command.`
                    )
                    .setColor(Colors.Red)
            ]
        });

        // Delete reply
        setTimeout(async () => await interaction.deleteReply(), 4000);

        return false;
    }

    return true;
}