/**
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function onEdit(e) {
	// Only look for edits on the first sheet
	/** @type {GoogleAppsScript.Spreadsheet.Sheet} */
	const sheet = e.source.getActiveSheet();

	if (sheet.getIndex() !== 1) {
		return;
	}

	const editedRange = e.range;
	const lastRow = sheet.getLastRow();

	// If the user edits the first column of the last row, treat as new row
	if (editedRange.getRow() === lastRow && editedRange.getColumn() === 1) {
		Logger.log(`New row detected at row ${lastRow}`);
		sendToDiscord(sheet, lastRow);
	}
}

/**
 * @param {GoogleAppsScript.Events.SheetsOnChange} e
 */
function onChange(e) {
	// Only look for row insertions
	if (e.changeType !== 'EDIT') {
		return;
	}

	/** @type {GoogleAppsScript.Spreadsheet.Spreadsheet} */
	const ss = e.source;

	/** @type {GoogleAppsScript.Spreadsheet.Sheet} */
	const sheet = ss.getActiveSheet();

	// Only act on the first sheet
	if (sheet.getIndex() !== 1) {
		return;
	}

	// Get the new last row after the insert
	const lastRow = sheet.getLastRow();

	sendToDiscord(sheet, lastRow);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} sheet
 * @param {number} rowNumber
 */
function sendToDiscord(sheet, rowNumber) {
	try {
		// Get webhook URL from second sheet
		const webhookUrl = getWebhookUrl();

		if (!webhookUrl) {
			Logger.log('Webhook URL not found');
			return;
		}

		// Get data from the specific row
		const maxColumns = sheet.getLastColumn();
		const rowData = sheet.getRange(rowNumber, 1, 1, maxColumns).getValues()[0];
		const headers = sheet.getRange(1, 1, 1, maxColumns).getValues()[0];

		// Skip if row is completely empty
		if (rowData.every((cell) => cell === '')) {
			Logger.log('Skipping empty row');
			return;
		}

		// Create Discord Embed Fields
		const fields = parseFields(headers, rowData);

		// Create Discord Webhook Payload
		const payload = createPayload(fields);

		// Send to Discord Webhook with retry logic
		sendWebook(payload, webhookUrl, rowNumber);
	} catch (error) {
		Logger.log('Error in sendToDiscord: ' + error.toString());
	}
}

/**
 * @param {EmbedField[]} fields
 */
function createPayload(fields) {
	let payload = {
		embeds: [
			{
				title: 'Application Submitted',
				color: 0x5865f2, // Blurple color
				fields: fields,
				timestamp: new Date().toISOString(),
			},
		],
	};

	const manualVerificationField = fields.find((field) => field.name == 'review_verification');
	const isManualVerificationRequired = manualVerificationField?.value === 'true';

	if (isManualVerificationRequired) {
		payload['components'] = createButtonComponents();
	}

	return payload;
}

function createButtonComponents() {
	return [
		{
			type: 1,
			components: [
				{
					type: 2,
					style: 3,
					label: 'Accept',
					emoji: null,
					disabled: false,
					custom_id: `verify_application:accept`,
				},
				{
					type: 2,
					style: 4,
					label: 'Decline',
					emoji: null,
					disabled: false,
					custom_id: `verify_application:decline`,
				},
			],
		},
	];
}

/**
 * @param {string[]} headers
 * @param {string[]} rowData
 */
function parseFields(headers, rowData) {
	// Create embed fields from row data
	let fields = [];
	for (let i = 0; i < headers.length && i < rowData.length; i++) {
		if (rowData[i] !== '' && headers[i] !== '') {
			// Truncate long values for Discord embed limits
			let value = rowData[i].toString();
			if (value.length > 1024) {
				value = value.substring(0, 1021) + '...';
			}

			fields.push({
				name: headers[i].toString().substring(0, 256), // Discord field name limit
				value: value,
				inline: true,
			});
		}
	}

	// Discord embed limits: max 25 fields
	if (fields.length > 25) {
		fields = fields.slice(0, 24);
		fields.push({
			name: 'Note',
			value: `... and ${rowData.length - 24} more fields`,
			inline: false,
		});
	}

	return fields;
}

function getWebhookUrl() {
	try {
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		const sheets = spreadsheet.getSheets();

		if (sheets.length < 2) {
			Logger.log('Second sheet not found');
			return null;
		}

		const secondSheet = sheets[1];
		const lastRow = secondSheet.getLastRow();

		if (lastRow < 1) {
			Logger.log('No data in second sheet');
			return null;
		}

		// Get all data from first two columns
		const data = secondSheet.getRange(1, 1, lastRow, 2).getValues();

		// Find the row with DISCORD_WEBHOOK_URL in first column
		for (let i = 0; i < data.length; i++) {
			if (data[i][0] && data[i][0].toString().trim() === 'DISCORD_WEBHOOK_URL') {
				const url = data[i][1] ? data[i][1].toString().trim() : '';
				if (url && url.startsWith('https://discord.com/')) {
					return url;
				}
			}
		}

		Logger.log('DISCORD_WEBHOOK_URL not found or invalid');
		return null;
	} catch (error) {
		Logger.log('Error getting webhook URL: ' + error.toString());
		return null;
	}
}

function sendWebook(payload, webhookUrl, rowNumber) {
	const maxRetries = 3;
	let success = false;

	for (let attempt = 1; attempt <= maxRetries && !success; attempt++) {
		try {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				payload: JSON.stringify(payload),
			};

			const response = UrlFetchApp.fetch(webhookUrl, options);

			if (response.getResponseCode() === 204) {
				Logger.log(`Success row number: ${rowNumber}`);
				success = true;
			} else if (response.getResponseCode() === 429) {
				// Rate limited, wait and retry
				Logger.log(`Rate limited, retrying in ${attempt * 2} seconds...`);
				Utilities.sleep(attempt * 2000);
			} else {
				Logger.log(`Error sending to Discord (attempt ${attempt}): ${response.getResponseCode()}`);
			}
		} catch (fetchError) {
			Logger.log(`Network error (attempt ${attempt}): ${fetchError.toString()}`);
			if (attempt < maxRetries) {
				Utilities.sleep(attempt * 1000);
			}
		}
	}

	if (!success) {
		Logger.log(`Failed to send row ${rowNumber} after ${maxRetries} attempts`);
	}
}
