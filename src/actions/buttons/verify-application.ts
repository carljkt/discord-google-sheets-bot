import type { ButtonInteraction } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, roleMention, EmbedBuilder, WebhookClient } from 'discord.js';
import { type ButtonAction } from '@/actions/index.js';
import { createErrorEmbed } from '@/components/embeds.js';
import { ActionType, ButtonActionID } from '@/types/index.js';
import { parseCustomId } from '@/util/componentUtils.js';
import { readConfig } from '@/util/config.js';

enum ApplicationAction {
	Decline = 'decline',
	Accept = 'accept',
}

/**
 * This will run when user interacts with the verification approval buttons from the webhook.
 * When a user gets Accepted this will give the verified role to the user
 * Declining does nothing
 *
 */
export default {
	id: ButtonActionID.VerifyApplication,
	type: ActionType.Button,
	async execute(interaction: ButtonInteraction) {
		await interaction.deferUpdate();

		const { actionName } = parseCustomId<['action', 'actionName']>(interaction.customId, ['action', 'actionName']);

		const applicationEmbed = interaction.message.embeds[0];
		const fields = applicationEmbed.fields;

		const userIdField = fields.find((field) => field.name === 'discord_user_id');

		const config = await readConfig();

		const webhook = new WebhookClient({ url: config.LOGS_WEBHOOK_URL });
		const updatedEmbed = new EmbedBuilder(applicationEmbed.data);

		const actionRow = updateButtonState(this.id, actionName);

		// User Application is Rejected
		if (actionName === ApplicationAction.Decline) {
			await handleApplicationDeclined(webhook, interaction, updatedEmbed, actionRow);
			return;
		}

		// User Application is Accepted

		// The member is not on the server
		const member = userIdField?.value && interaction.guild?.members.cache.get(userIdField.value);
		if (!member) {
			await handleMemberDoesntExist(webhook, interaction, updatedEmbed, actionRow);
			return;
		}

		// Check if user have the role already
		if (member.roles.cache.has(config.VERIFIED_ROLE_ID)) {
			await handleMemberAlreadyVerified(webhook, interaction, updatedEmbed, actionRow);
			return;
		}

		// Give verified role
		await member.roles.add(config.VERIFIED_ROLE_ID).catch(async (error) => {
			console.error(error);
			await interaction.editReply({ content: `❌ Couldn't give ${roleMention(config.VERIFIED_ROLE_ID)} role` });
		});

		// Remove unverified role
		if (config.UNVERIFIED_ROLE_ID && member.roles.cache.has(config.UNVERIFIED_ROLE_ID)) {
			await member.roles.remove(config.UNVERIFIED_ROLE_ID).catch((error) => console.error(error));
		}

		updatedEmbed.setTitle('Application Accepted');
		updatedEmbed.setColor('Green');

		await webhook.editMessage(interaction.message.id, { embeds: [updatedEmbed], components: [actionRow] });
	},
} satisfies ButtonAction;

function updateButtonState(name: string, actionName: string) {
	const buttons = [
		new ButtonBuilder()
			.setCustomId(`${name}:${ApplicationAction.Accept}}`)
			.setLabel('Accept')
			.setDisabled(true)
			.setStyle(actionName === ApplicationAction.Accept ? ButtonStyle.Success : ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(`${name}:${ApplicationAction.Decline}}`)
			.setDisabled(true)
			.setLabel('Decline')
			.setStyle(actionName === ApplicationAction.Decline ? ButtonStyle.Danger : ButtonStyle.Secondary),
	];

	return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

async function handleApplicationDeclined(
	webhook: WebhookClient,
	interaction: ButtonInteraction,
	updatedEmbed: EmbedBuilder,
	actionRow: ActionRowBuilder<ButtonBuilder>,
) {
	// TODO: Should we DM the user about getting declined

	// Update embed state...
	updatedEmbed.setTitle('Application Declined');
	updatedEmbed.setColor('Red');

	// Update buttons state...
	await webhook.editMessage(interaction.message.id, { embeds: [updatedEmbed], components: [actionRow] });
}

async function handleMemberDoesntExist(
	webhook: WebhookClient,
	interaction: ButtonInteraction,
	updatedEmbed: EmbedBuilder,
	actionRow: ActionRowBuilder<ButtonBuilder>,
) {
	const memberNotExistEmbed = createErrorEmbed({
		title: `Member doesn't exist`,
		description: 'The member is not on the server',
	});
	await webhook.editMessage(interaction.message.id, { embeds: [updatedEmbed], components: [actionRow] });
	await interaction.editReply({ embeds: [memberNotExistEmbed] });
}

async function handleMemberAlreadyVerified(
	webhook: WebhookClient,
	interaction: ButtonInteraction,
	updatedEmbed: EmbedBuilder,
	actionRow: ActionRowBuilder<ButtonBuilder>,
) {
	const memberAlreadyVerifiedEmbed = createErrorEmbed({
		title: `Member already been verified`,
		description: 'The member has already been verified',
	});
	await webhook.editMessage(interaction.message.id, { embeds: [updatedEmbed], components: [actionRow] });
	await interaction.editReply({ embeds: [memberAlreadyVerifiedEmbed] });
}
