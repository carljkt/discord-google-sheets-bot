import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { z } from 'zod';

const configSchema = z
	.object({
		AUTO_VERIFY: z.boolean(),
		VERIFIED_ROLE_ID: z.string(),
		UNVERIFIED_ROLE_ID: z.string(),
		LOGS_CHANNEL_ID: z.string(),
		LOGS_WEBHOOK_URL: z.string(),
		GOOGLE_SHEET_ID: z.string(),
	})
	.refine(
		({ UNVERIFIED_ROLE_ID, VERIFIED_ROLE_ID }) => {
			if (!UNVERIFIED_ROLE_ID && !VERIFIED_ROLE_ID) return true;
			return UNVERIFIED_ROLE_ID !== VERIFIED_ROLE_ID;
		},
		{
			path: ['UNVERIFIED_ROLE_ID', 'VERIFIED_ROLE_ID'],
			message: 'UNVERIFIED_ROLE_ID must not be the same as VERIFIED_ROLE_ID',
		},
	);

// Define type for config
export type Config = z.infer<typeof configSchema>;

// Path to config.json in project root
const CONFIG_PATH = join(process.cwd(), 'config.json');

export async function readConfig(): Promise<Config> {
	const configData = await readFile(CONFIG_PATH, 'utf8');

	const { data, error } = configSchema.safeParse(JSON.parse(configData));
	if (error) {
		const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
		throw new Error(`Configuration validation failed: ${errorMessages}`);
	}

	return data;
}

export async function writeConfig(partialConfig: Partial<Config>) {
	let existingConfig = {};
	try {
		const fileData = await readFile(CONFIG_PATH, 'utf8');
		existingConfig = JSON.parse(fileData);
	} catch (error) {
		// If file doesn't exist or is invalid JSON, start fresh
		if (!(error instanceof Error && typeof (error as any).code === 'string' && (error as any).code === 'ENOENT'))
			throw error;
	}

	const mergedConfig = { ...existingConfig, ...partialConfig };

	// Validate the merged configuration using Zod safeParse
	const { data, error, success } = configSchema.safeParse(mergedConfig);

	if (!success) {
		// Create a more readable error message
		const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
		throw new Error(`Configuration validation failed: ${errorMessages}`);
	}

	// Write the validated configuration to file
	await writeFile(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
}
