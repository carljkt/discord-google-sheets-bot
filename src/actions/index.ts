import type { AnySelectMenuInteraction, ButtonInteraction, Client, ModalSubmitInteraction } from 'discord.js';
import { z } from 'zod';
import { ActionType } from '@/types/index.js';
import type { StructurePredicate } from '@/util/loaders.js';

export type ButtonAction = {
	id: string;
	type: ActionType.Button;
	execute(interaction: ButtonInteraction, client: Client): Promise<void> | void;
};

export type ModalAction = {
	id: string;
	type: ActionType.Modal;
	execute(interaction: ModalSubmitInteraction, client: Client): Promise<void> | void;
};

export type SelectMenuAction = {
	id: string;
	type: ActionType.SelectMenu;
	execute(interaction: AnySelectMenuInteraction, client: Client): Promise<void> | void;
};

// Type guard functions
export function isButtonAction(action: ComponentAction): action is ButtonAction {
	return (action as ButtonAction).type === ActionType.Button;
}

export function isModalAction(action: ComponentAction): action is ModalAction {
	return (action as ModalAction).type === ActionType.Modal;
}

export function isSelectMenuAction(action: ComponentAction): action is SelectMenuAction {
	return (action as SelectMenuAction).type === ActionType.SelectMenu;
}

export type ComponentAction = ButtonAction | ModalAction | SelectMenuAction;

/**
 * Defines the schema for a command
 */
export const schema = z.object({
	id: z.string(),
	type: z.string(),
	execute: z.function(),
});

/**
 * Defines the predicate to check if an object is a valid Command type.
 */
export const predicate: StructurePredicate<ComponentAction> = (structure: unknown): structure is ComponentAction =>
	schema.safeParse(structure).success;
