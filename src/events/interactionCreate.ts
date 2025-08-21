import { URL } from 'node:url';
import { Events } from 'discord.js';
import handleModalSubmitInteraction from '@/handlers/modalSubmitInteraction.js';
import handleButtonInteraction from '../handlers/buttonInteraction.js';
import handleSelectMenuInteraction from '../handlers/selectMenuInteraction.js';
import { loadActions, loadCommands } from '../util/loaders.js';
import type { Event } from './index.js';

const commands = await loadCommands(new URL('../commands/', import.meta.url));
const { buttonActions, modalActions, menuActions } = await loadActions(new URL('../actions', import.meta.url));

export default {
	name: Events.InteractionCreate,
	async execute(client, interaction) {
		if (interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu()) {
			const [actionId] = interaction.customId.split(':');

			if (interaction.isButton()) {
				const buttonAction = buttonActions.get(actionId);
				if (!buttonAction) throw new Error(`Button action '${actionId}' not found.`);

				await handleButtonInteraction(client, interaction, buttonAction);
			}

			if (interaction.isAnySelectMenu()) {
				const selectMenuAction = menuActions.get(actionId);

				if (!selectMenuAction) throw new Error(`Select Menu action '${actionId}' not found.`);

				await handleSelectMenuInteraction(client, interaction, selectMenuAction);
			}

			if (interaction.isModalSubmit()) {
				const modalAction = modalActions.get(actionId);
				if (!modalAction) throw new Error(`Modal action '${actionId}' not found.`);

				await handleModalSubmitInteraction(client, interaction, modalAction);
			}
		}

		if (interaction.isChatInputCommand()) {
			const command = commands.get(interaction.commandName);

			if (!command) throw new Error(`Command '${interaction.commandName}' not found.`);

			await command.execute(interaction, client);
		}
	},
} satisfies Event<Events.InteractionCreate>;
