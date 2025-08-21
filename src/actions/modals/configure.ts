import type { ModalAction } from '@/actions/index.js';
import { createSettingsComponent } from '@/components/settings.js';
import { ActionType, ModalActionID, ModalInputsID } from '@/types/index.js';
import { type Config, readConfig, writeConfig } from '@/util/config.js';

export default {
	id: ModalActionID.ConfigureSettings,
	type: ActionType.Modal,
	async execute(interaction) {
		await interaction.deferUpdate();

		let google_sheet_id;
		if (interaction.fields.fields.has(ModalInputsID.GoogleSheetId)) {
			const rawProductUrl = interaction.fields.getTextInputValue(ModalInputsID.GoogleSheetId).trim();
			if (rawProductUrl) {
				google_sheet_id = rawProductUrl;
			}
		}

		const configUpdate: Partial<Config> = {};
		if (google_sheet_id !== undefined) configUpdate.GOOGLE_SHEET_ID = google_sheet_id;

		await writeConfig(configUpdate);
		const config = await readConfig();
		const configComponent = createSettingsComponent(config);
		await interaction.message?.edit({ components: [configComponent] });
	},
} satisfies ModalAction;
