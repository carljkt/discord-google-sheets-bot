import type { ButtonInteraction, Client } from 'discord.js';
import type { ButtonAction } from '../actions/index.js';
import { createUnauthorizedEmbed } from '../components/embeds.js';
import { getInitiatorID } from '../util/componentUtils.js';

export default async function handleButtonInteraction(
	client: Client,
	interaction: ButtonInteraction,
	buttonAction: ButtonAction,
) {
	const initiatorId = getInitiatorID(interaction.customId);
	// Filter Button Interactions to only who initialized the command
	if (initiatorId && initiatorId !== interaction.user.id) {
		await interaction
			.reply({
				embeds: [createUnauthorizedEmbed()],
				ephemeral: true,
				allowedMentions: { repliedUser: true },
			})
			.catch(() => {});
		return;
	}

	await buttonAction.execute(interaction, client);
}
