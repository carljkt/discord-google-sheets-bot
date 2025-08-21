import type { ButtonInteraction, ModalActionRowComponentBuilder } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { type ButtonAction } from '@/actions/index.js';
import { createSettingsComponent } from '@/components/settings.js';
import { ActionType, ButtonActionID, ModalInputsID, SettingsActions } from '@/types/index.js';
import { parseCustomId } from '@/util/componentUtils.js';
import { readConfig, writeConfig } from '@/util/config.js';

/**
 * This will run when user interacts with the [/settings command](../../commands/settings.ts) buttons.
 * It toggles the Auto Verify settings
 * It resets the role from Unverified Role
 * It shows a modal to change the Google Sheet ID
 *
 */
export default {
	id: ButtonActionID.ConfigureSettings,
	type: ActionType.Button,
	async execute(interaction: ButtonInteraction) {
		const { actionName } = parseCustomId<['actionId', 'actionName']>(interaction.customId, ['actionId', 'actionName']);

		const config = await readConfig();

		if (actionName === SettingsActions.EditGoogleSheetId) {
			const modal = new ModalBuilder().setCustomId(this.id).setTitle('Edit Settings');

			const productUrlActionRow = createProductURLModal(config.GOOGLE_SHEET_ID);
			modal.addComponents(productUrlActionRow);

			await interaction.showModal(modal);
		}

		if (actionName === SettingsActions.ToggleAutoVerify) {
			await interaction.deferUpdate();
			await writeConfig({ AUTO_VERIFY: !config.AUTO_VERIFY });

			const settingsComponent = createSettingsComponent({ ...config, AUTO_VERIFY: !config.AUTO_VERIFY });
			await interaction.editReply({ components: [settingsComponent] });
		}

		if (actionName === SettingsActions.ResetUnverifiedRole) {
			await interaction.deferUpdate();
			await writeConfig({ UNVERIFIED_ROLE_ID: '' });

			const settingsComponent = createSettingsComponent({ ...config, UNVERIFIED_ROLE_ID: '' });
			await interaction.editReply({ components: [settingsComponent] });
		}
	},
} satisfies ButtonAction;

function createProductURLModal(sheet_id: string) {
	const sheetIdInput = new TextInputBuilder()
		.setCustomId(ModalInputsID.GoogleSheetId)
		.setLabel('Edit Google Sheet ID')
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true)
		.setPlaceholder('Google Sheet ID')
		.setValue(sheet_id)
		.setMaxLength(300);

	return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(sheetIdInput);
}
