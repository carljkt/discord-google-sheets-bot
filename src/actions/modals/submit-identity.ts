import type { ModalSubmitInteraction } from 'discord.js';
import { MessageFlags, roleMention } from 'discord.js';
import type { ModalAction } from '@/actions/index.js';
import { getSpreadSheet } from '@/services/google-spreadsheet/index.js';
import { ActionType, ModalActionID, ModalInputsID } from '@/types/index.js';
import { readConfig } from '@/util/config.js';

export default {
	id: ModalActionID.SubmitIdentity,
	type: ActionType.Modal,
	async execute(interaction) {
		await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

		const config = await readConfig();

		const user_name = interaction.fields.getTextInputValue(ModalInputsID.PersonName).trim();
		const favorite_fruit = interaction.fields.getTextInputValue(ModalInputsID.FavoriteFruit).trim();

		// Send the submitted data to Google Sheets API
		const doc = await getSpreadSheet();

		if (!doc) {
			await interaction.editReply({ content: `Couldn't submit to Google Sheets API` });
			return;
		}

		const sheet = doc.sheetsByIndex[0];
		await sheet
			.addRow({
				name: user_name,
				favorite_fruit,
				discord_user_id: interaction.user.id,
				discord_username: interaction.user.globalName ?? interaction.user.displayName,
				submitted_at: interaction.createdAt,
				review_verification: config.AUTO_VERIFY === false,
			})
			.catch(async (error) => {
				console.error(error);

				// This should be sent on logs channel
				await interaction.editReply({ content: `Couldn't submit to Google Sheets API` });
			});

		if (!config.AUTO_VERIFY) {
			await interaction.editReply({ content: '✅ Please wait while we manually verify your identity' });
			return;
		}

		// Automatically Give Role upon Submit
		if (!interaction.inCachedGuild()) return;

		if (!interaction.member.roles.cache.has(config.VERIFIED_ROLE_ID)) {
			await addVerifiedRole(interaction, config.VERIFIED_ROLE_ID);
		}

		// Check if member has unverified role in order to remove
		if (config.UNVERIFIED_ROLE_ID && interaction.member.roles.cache.has(config.UNVERIFIED_ROLE_ID)) {
			await removeUnverifiedRole(interaction, config.UNVERIFIED_ROLE_ID);
		}

		await interaction.editReply({ content: `✅ Verification Success` });
	},
} satisfies ModalAction;

async function removeUnverifiedRole(interaction: ModalSubmitInteraction<'cached'>, roleId: string) {
	try {
		await interaction.member.roles.remove(roleId);
	} catch (error) {
		console.error(error);
		await interaction.editReply({ content: `Couldn't remove ${roleMention(roleId)} from the user` });
	}
}

async function addVerifiedRole(interaction: ModalSubmitInteraction<'cached'>, roleId: string) {
	await interaction.member.roles.add(roleId).catch(async (error) => {
		console.error(error);
		await interaction.editReply({ content: `❌ Couldn't give ${roleMention(roleId)} role` });
	});
}
