import type { MessageActionRowComponentBuilder } from 'discord.js';
import {
	ContainerBuilder,
	TextDisplayBuilder,
	SectionBuilder,
	ButtonBuilder,
	ButtonStyle,
	SeparatorBuilder,
	SeparatorSpacingSize,
	Colors,
	ActionRowBuilder,
	RoleSelectMenuBuilder,
	roleMention,
	ChannelSelectMenuBuilder,
	ChannelType,
	channelMention,
} from 'discord.js';
import { ButtonActionID, SettingsActions } from '@/types/index.js';
import type { Config } from '@/util/config.js';

export function createSettingsComponent(config: Config) {
	return (
		new ContainerBuilder()
			.setAccentColor(Colors.Blurple)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent('## Configure Bot Settings'))

			// Auto Verify
			.addSectionComponents(createAutoVerifySectionComponent(config.AUTO_VERIFY))
			.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
			// Verified Role
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`**Verified Role:** ${config.VERIFIED_ROLE_ID ? roleMention(config.VERIFIED_ROLE_ID) : 'NONE'}\n-# This role will be given when user gets verified`,
				),
			)
			.addActionRowComponents(
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					new RoleSelectMenuBuilder()
						.setCustomId('configure-role-menu:verified')
						.setPlaceholder('Select verified role')
						.setMaxValues(1)
						.setMinValues(1),
				),
			)
			.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))

			// Unverified Role
			.addSectionComponents(
				new SectionBuilder()
					.setButtonAccessory(
						new ButtonBuilder()
							.setCustomId(`${ButtonActionID.ConfigureSettings}:${SettingsActions.ResetUnverifiedRole}`)
							.setLabel('Reset')
							.setDisabled(Boolean(!config.UNVERIFIED_ROLE_ID))
							.setStyle(config.UNVERIFIED_ROLE_ID ? ButtonStyle.Primary : ButtonStyle.Secondary),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`**Unverified Role:** ${config.UNVERIFIED_ROLE_ID ? roleMention(config.UNVERIFIED_ROLE_ID) : 'NONE'}\n-# This role will be removed when user gets verified`,
						),
					),
			)

			.addActionRowComponents(
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					new RoleSelectMenuBuilder()
						.setCustomId('configure-role-menu:unverified')
						.setPlaceholder('Select unverified role')
						.setMaxValues(1)
						.setMinValues(1),
				),
			)
			.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))

			// Logs Channel
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`**Logs Channel:** ${config.LOGS_CHANNEL_ID ? channelMention(config.LOGS_CHANNEL_ID) : 'NONE'}\n-# Send logs to this channel`,
				),
			)
			.addActionRowComponents(
				new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
					new ChannelSelectMenuBuilder()
						.setChannelTypes(ChannelType.GuildText)
						.setCustomId('logs-channel-menu')
						.setPlaceholder('Select log channel')
						.setMaxValues(1)
						.setMinValues(1),
				),
			)

			.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
			.addSectionComponents(createGoogleSheetIDComponent(config.GOOGLE_SHEET_ID))
	);
}

function createAutoVerifySectionComponent(AUTO_VERIFY: boolean) {
	const enabledText = AUTO_VERIFY ? 'ENABLED' : 'DISABLED';
	const buttonStyle = AUTO_VERIFY ? ButtonStyle.Danger : ButtonStyle.Success;
	const buttonText = AUTO_VERIFY ? 'Disable' : 'Enable';
	return new SectionBuilder()
		.setButtonAccessory(
			new ButtonBuilder()
				.setStyle(buttonStyle)
				.setLabel(buttonText)
				.setCustomId(`${ButtonActionID.ConfigureSettings}:${SettingsActions.ToggleAutoVerify}`),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**Auto Verify:** ${enabledText}\n-# Setting this to DISABLED will require manual verification`,
			),
		);
}

function createGoogleSheetIDComponent(sheet_id: string) {
	return new SectionBuilder()
		.setButtonAccessory(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel('Edit')
				.setEmoji('🖊️')
				.setCustomId(`${ButtonActionID.ConfigureSettings}:${SettingsActions.EditGoogleSheetId}`),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Google Sheet ID:** ${sheet_id}`));
}
