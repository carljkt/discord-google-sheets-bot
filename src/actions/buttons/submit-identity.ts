import type { ButtonInteraction, ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { type ButtonAction } from '@/actions/index.js';
import { ActionType, ButtonActionID, ModalActionID, ModalInputsID } from '@/types/index.js';

/**
 * This will run when user interacts with the [identity verification panel](../../commands/setup.ts) buttons.
 * It shows a modal to fill up the verification form
 *
 */
export default {
	id: ButtonActionID.SubmitIdentity,
	type: ActionType.Button,
	async execute(interaction: ButtonInteraction) {
		const modal = createVerificationFormModal();

		await interaction.showModal(modal);
	},
} satisfies ButtonAction;

function createVerificationFormModal() {
	const modal = new ModalBuilder().setCustomId(ModalActionID.SubmitIdentity).setTitle('Verify Identity');

	const nameInput = new TextInputBuilder()
		.setCustomId(ModalInputsID.PersonName)
		.setLabel(`Whats your Name?`)
		.setStyle(TextInputStyle.Short)
		.setRequired(true)
		.setPlaceholder('John Doe')
		.setMaxLength(200);

	const favoriteInput = new TextInputBuilder()
		.setCustomId(ModalInputsID.FavoriteFruit)
		.setLabel(`Whats your Favorite Fruit?`)
		.setStyle(TextInputStyle.Short)
		.setRequired(true)
		.setPlaceholder('Apple')
		.setMaxLength(50);

	const nameActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput);
	const favoriteFruitActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(favoriteInput);

	return modal.addComponents([nameActionRow, favoriteFruitActionRow]);
}
