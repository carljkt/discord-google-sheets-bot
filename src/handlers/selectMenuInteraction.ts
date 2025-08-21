import type { AnySelectMenuInteraction, Client } from 'discord.js';
import type { SelectMenuAction } from '../actions/index.js';
import { createUnauthorizedEmbed } from '../components/embeds.js';
import { getInitiatorID } from '../util/componentUtils.js';

export default async function handleSelectMenuInteraction(
	client: Client,
	interaction: AnySelectMenuInteraction,
	selectMenuAction: SelectMenuAction,
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
	}

	await selectMenuAction.execute(interaction, client);
}
