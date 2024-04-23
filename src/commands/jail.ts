import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("jail")
  .setDescription("temporarily jails a user")
  .addUserOption((option) => option.setName("user").setDescription("The user to jail").setRequired(true))
  .addStringOption((option) => option.setName("reason").setDescription("The reason for jailing the user").setRequired(true));

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("Jailed!");
}
