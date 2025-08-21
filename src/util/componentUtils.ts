const DISCORD_USER_ID_REGEX = /i\d{17,20}:/; // Discord User ID prefixed with i

/**
 * Get who initialized the command from Component's Custom ID
 *
 * @param interaction_customId - Component Custom ID
 * @returns User ID of who initialized the command
 */
export function getInitiatorID(interaction_customId: string) {
	const initiatorId = DISCORD_USER_ID_REGEX.exec(interaction_customId);
	return initiatorId ? initiatorId[0].slice(1).replace(':', '') : null;
}

export type CustomIdObject<T extends string[]> = {
	[K in T[number]]: string;
};

/**
 * Parse the Interaction Custom ID into Object
 *
 * @example
 * // interaction.customId = "configure:someSubAction"
 * const args = parseCustomId(interaction.customId, ['actionName', 'subActionName']);
 * args.actionName // configure
 * args.subActionName // someSubAction
 * @param customId - Interaction's Custom ID
 * @param keys - Array of strings of keys
 * @returns
 */
export function parseCustomId<T extends string[]>(customId: string, keys: T): CustomIdObject<T> {
	const parts = customId.split(':');
	if (parts.length !== keys.length) {
		throw new Error(`Invalid customId format: ${customId}`);
	}

	return Object.fromEntries(keys.map((key, index) => [key, parts[index]])) as CustomIdObject<T>;
}
