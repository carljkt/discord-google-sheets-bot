import { MessageFlags } from 'discord.js';
import { createSettingsComponent } from '@/components/settings.js';
import { readConfig } from '@/util/config.js';
import type { Command } from './index.js';

export default {
	data: {
		name: 'settings',
		description: 'Configure bot settings',
	},
	user_permissions: ['ManageGuild'],
	async execute(interaction) {
		const config = await readConfig();
		const settingsComponent = createSettingsComponent(config);

		await interaction.reply({ components: [settingsComponent], flags: MessageFlags.IsComponentsV2 });
	},
} satisfies Command;
