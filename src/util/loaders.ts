import type { PathLike } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { URL } from 'node:url';
import type { ButtonAction, ModalAction, SelectMenuAction } from '../actions/index.js';
import { predicate as actionPredicate, isButtonAction, isModalAction, isSelectMenuAction } from '../actions/index.js';
import type { Command } from '../commands/index.js';
import { predicate as commandPredicate } from '../commands/index.js';
import type { Event } from '../events/index.js';
import { predicate as eventPredicate } from '../events/index.js';

/**
 * A predicate to check if the structure is valid
 */
export type StructurePredicate<T> = (structure: unknown) => structure is T;

/**
 * Loads all the structures in the provided directory
 *
 * @param dir - The directory to load the structures from
 * @param predicate - The predicate to check if the structure is valid
 * @param recursive - Whether to recursively load the structures in the directory
 * @returns
 */
export async function loadStructures<T>(
	dir: PathLike,
	predicate: StructurePredicate<T>,
	recursive = true,
): Promise<T[]> {
	// Get the stats of the directory
	const statDir = await stat(dir);

	// If the provided directory path is not a directory, throw an error
	if (!statDir.isDirectory()) {
		throw new Error(`The directory '${dir}' is not a directory.`);
	}

	// Get all the files in the directory
	const files = await readdir(dir);

	// Create an empty array to store the structures
	const structures: T[] = [];

	// Loop through all the files in the directory
	for (const file of files) {
		// Get the stats of the file
		const filePath = new URL(`${dir}/${file}`);
		const statFile = await stat(filePath);

		// If the file is a directory and recursive is true, recursively load the structures in the directory
		if (statFile.isDirectory()) {
			if (recursive) {
				structures.push(...(await loadStructures(filePath, predicate, recursive)));
			}

			continue;
		}

		// If the file is index.js or the file does not end with .js, skip the file
		if (file === 'index.js' || !file.endsWith('.js')) {
			continue;
		}

		// Import the structure dynamically from the file
		const structure = (await import(`${dir}/${file}`)).default;

		// If the structure is a valid structure, add it
		if (predicate(structure)) structures.push(structure);
	}

	return structures;
}

export async function loadCommands(dir: PathLike, recursive = true): Promise<Map<string, Command>> {
	return (await loadStructures(dir, commandPredicate, recursive)).reduce(
		(acc, cur) => acc.set(cur.data.name, cur),
		new Map<string, Command>(),
	);
}

export async function loadEvents(dir: PathLike, recursive = true): Promise<Event[]> {
	return loadStructures(dir, eventPredicate, recursive);
}

export async function loadActions(
	dir: PathLike,
	recursive = true,
): Promise<{
	buttonActions: Map<string, ButtonAction>;
	menuActions: Map<string, SelectMenuAction>;
	modalActions: Map<string, ModalAction>;
}> {
	const actions = await loadStructures(dir, actionPredicate, recursive);

	const buttonActions = new Map<string, ButtonAction>();
	const modalActions = new Map<string, ModalAction>();
	const menuActions = new Map<string, SelectMenuAction>();

	for (const action of actions) {
		if (isButtonAction(action)) {
			buttonActions.set(action.id, action);
		} else if (isModalAction(action)) {
			modalActions.set(action.id, action);
		} else if (isSelectMenuAction(action)) {
			menuActions.set(action.id, action);
		}
	}

	return { buttonActions, modalActions, menuActions };
}
