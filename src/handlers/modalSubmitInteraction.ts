import type { Client, ModalSubmitInteraction } from 'discord.js';
import type { ModalAction } from '../actions/index.js';

export default async function handleModalSubmitInteraction(
	client: Client,
	interaction: ModalSubmitInteraction,
	modalAction: ModalAction,
) {
	await modalAction.execute(interaction, client);
}
