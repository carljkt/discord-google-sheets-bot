import { type SelectMenuAction } from '@/actions/index.js';
import { createSettingsComponent } from '@/components/settings.js';
import { ActionType, SelectMenuActionID } from '@/types/index.js';
import { parseCustomId } from '@/util/componentUtils.js';
import type { Config } from '@/util/config.js';
import { readConfig, writeConfig } from '@/util/config.js';

/**
 * This will run when user interacts with the [/setttings role menus](../../commands/settings.ts).
 * It sets the unverified/verified role to config
 *
 */
export default {
	id: SelectMenuActionID.ConfigureRoles,
	type: ActionType.SelectMenu,
	async execute(interaction) {
		if (!interaction.isRoleSelectMenu()) {
			return;
		}

		const { actionName } = parseCustomId<['actionId', 'actionName']>(interaction.customId, ['actionId', 'actionName']);
		const selectedRoleId = interaction.values[0];
		const configUpdate: Partial<Config> = {};

		if (actionName === 'unverified') {
			configUpdate.UNVERIFIED_ROLE_ID = selectedRoleId;
		} else if (actionName === 'verified') {
			configUpdate.VERIFIED_ROLE_ID = selectedRoleId;
		}

		await interaction.deferUpdate();

		await writeConfig(configUpdate);

		const config = await readConfig();
		const configComponent = createSettingsComponent(config);

		await interaction.message.edit({ components: [configComponent] });
	},
} satisfies SelectMenuAction;
