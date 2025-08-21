import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	channelMention,
	ChannelType,
	EmbedBuilder,
	roleMention,
} from 'discord.js';
import { ButtonActionID } from '@/types/index.js';
import type { Command } from './index.js';

export default {
	data: {
		name: 'setup',
		description: 'Setup the verification form to a specified channel',
		options: [
			{
				name: 'channel',
				description: 'Select the channel where to post the verification form',
				type: ApplicationCommandOptionType.Channel,
				channel_types: [ChannelType.GuildText],
				required: true,
			},
			{
				name: 'verified_role',
				description: 'Select a role to give when user gets verified',
				type: ApplicationCommandOptionType.Role,
				required: true,
			},
		],
	},
	user_permissions: ['ManageGuild'],
	bot_permissions: ['ViewChannel', 'SendMessages'],
	async execute(interaction) {
		const formChannel = interaction.options.getChannel<ChannelType.GuildText>('channel', true);
		const verifiedRole = interaction.options.getRole('verified_role', true);

		const formEmbed = createVerifyIdentityEmbed(verifiedRole.id);

		const fillUpActionRow = createVerifyIdentityActionRow();

		// Should we update the config.VERIFIED_ROLE_ID here when the panel is sent.

		await formChannel
			.send({ embeds: [formEmbed], components: [fillUpActionRow] })
			.then(async () => {
				await interaction.reply(`Verification Form sent to ${channelMention(formChannel.id)}`);
			})
			.catch(async () => {
				await interaction.reply(`Couldn't send the form to the channel`);
			});
	},
} satisfies Command;

function createVerifyIdentityEmbed(verified_role_id: string) {
	return new EmbedBuilder()
		.setTitle('Identity Verification')
		.setDescription(
			`In order to get ${roleMention(verified_role_id)} role and to fully access our server, you must verify your identity first.`,
		)
		.setColor('Blurple');
}

function createVerifyIdentityActionRow() {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(ButtonActionID.SubmitIdentity)
			.setLabel('Verify Identity')
			.setEmoji('👆')
			.setStyle(ButtonStyle.Primary),
	);
}
