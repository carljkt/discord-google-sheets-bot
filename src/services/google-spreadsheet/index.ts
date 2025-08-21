import process from 'node:process';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { readConfig } from '@/util/config.js';

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
	email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
	key: process.env.GOOGLE_PRIVATE_KEY,
	scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Cache for spreadsheet instances
const spreadsheetCache = new Map<string, GoogleSpreadsheet>();

/**
 * Gets a GoogleSpreadsheet instance, with caching based on sheet ID
 * Creates a new instance only when the sheet ID changes
 */
export async function getSpreadSheet(): Promise<GoogleSpreadsheet | null> {
	try {
		// Get current config (this might change during runtime)
		const config = await readConfig();

		if (!config.GOOGLE_SHEET_ID) {
			console.warn('No Google Sheet ID found in config');
			return null;
		}

		// Return cached instance if it exists
		if (spreadsheetCache.has(config.GOOGLE_SHEET_ID)) {
			return spreadsheetCache.get(config.GOOGLE_SHEET_ID)!;
		}

		// Create new instance and cache it
		const doc = new GoogleSpreadsheet(config.GOOGLE_SHEET_ID, serviceAccountAuth);
		await initializeSheetWithHeaders(doc);
		spreadsheetCache.set(config.GOOGLE_SHEET_ID, doc);

		return doc;
	} catch (error) {
		console.error('Error getting spreadsheet:', error);
		return null;
	}
}

export async function initializeSheetWithHeaders(doc: GoogleSpreadsheet): Promise<void> {
	try {
		await doc.loadInfo();
		const sheet = doc.sheetsByIndex[0];

		await sheet.setHeaderRow([
			'name',
			'favorite_fruit',
			'discord_user_id',
			'discord_username',
			'submitted_at',
			'review_verification',
		]);
	} catch (error) {
		console.error('❌ Error initializing sheet:', error);
	}
}

async function getConfigSheet(doc: GoogleSpreadsheet) {
	// Try to find sheet named 'config'
	let sheet = doc.sheetsByTitle.config;

	if (!sheet) {
		// Create if missing
		sheet = await doc.addSheet({ title: 'config', headerValues: ['key', 'value'] });
		console.log("Created 'config' sheet");
	}

	return sheet;
}

export type ConfigKey = 'DISCORD_WEBHOOK_URL';

export type ConfigRowsData = {
	key: ConfigKey;
	value: string;
};

export async function getConfigSheetValue<T>(doc: GoogleSpreadsheet, key: keyof ConfigRowsData): Promise<T | null> {
	const sheet = await getConfigSheet(doc);
	const rows = await sheet.getRows<ConfigRowsData>();

	const row = rows.find((row) => row.get('key') === key);
	return row ? row.get('value') : null;
}

export async function setConfigSheetValue(doc: GoogleSpreadsheet, configKey: ConfigKey, value: string) {
	const sheet = await getConfigSheet(doc);
	const rows = await sheet.getRows<ConfigRowsData>();

	// Compare against the "key" column content
	const row = rows.find((currentRow) => currentRow.get('key') === configKey);

	if (row) {
		row.set('value', value); // always update the "value" column
		await row.save();
	} else {
		await sheet.addRow({ key: configKey, value });
	}
}
