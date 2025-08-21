import process from 'node:process';
import type { NewsChannel, TextChannel } from 'discord.js';
import { ChannelType, MessageFlags } from 'discord.js';
import { createSettingsComponent } from '@/components/settings.js';
import { getSpreadSheet, setConfigSheetValue } from '@/services/google-spreadsheet/index.js';
import { ActionType, SelectMenuActionID } from '@/types/index.js';
import type { Config } from '@/util/config.js';
import { readConfig, writeConfig } from '@/util/config.js';
import type { SelectMenuAction } from '../index.js';

export default {
	id: SelectMenuActionID.ConfigureLogsChannel,
	type: ActionType.SelectMenu,
	async execute(interaction) {
		if (!interaction.isChannelSelectMenu() || !interaction.inCachedGuild()) {
			return;
		}

		const channel = interaction.channels.first();

		if (!channel) {
			await interaction.reply({ content: 'Channel not found.', flags: [MessageFlags.Ephemeral] });
			return;
		}

		// Make sure the channel can have webhooks
		if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel?.type)) {
			await interaction.reply({
				content: 'That channel cannot have webhooks.',
				flags: [MessageFlags.Ephemeral],
			});
			return;
		}

		if (!channel.isSendable() || channel.isDMBased() || channel.isVoiceBased() || channel.isThread()) {
			return;
		}

		await interaction.deferUpdate();

		const configUpdate: Partial<Config> = {
			LOGS_CHANNEL_ID: channel.id,
		};

		await writeConfig(configUpdate);

		const config = await readConfig();
		await createWebhook(channel);
		const configComponent = createSettingsComponent(config);

		await interaction.message.edit({ components: [configComponent] });
	},
} satisfies SelectMenuAction;

async function createWebhook(channel: NewsChannel | TextChannel): Promise<string | undefined> {
	try {
		// Fetch existing webhooks
		const webhooks = await channel.fetchWebhooks();
		let webhook = webhooks.find((wh) => wh.owner && wh.owner.id === process.env.APPLICATION_ID);

		if (!webhook) {
			// Create a new webhook if none exist
			webhook = await channel.createWebhook({
				name: channel.client.user.displayName,
				avatar: channel.client.user.displayAvatarURL(),
			});
		}

		await writeConfig({ LOGS_WEBHOOK_URL: webhook.url });
		const doc = await getSpreadSheet();
		await setConfigSheetValue(doc!, 'DISCORD_WEBHOOK_URL', webhook.url);

		return webhook.url;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}
