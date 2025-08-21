# Discord Google Sheets Bot

A minimal Discord bot written in **TypeScript** using **discord.js**, designed to showcase communication between Discord and **Google Sheets** via the `google-spreadsheet` package and Google Apps Script (`.gs`).

https://github.com/user-attachments/assets/9af90777-57f2-491c-a4f0-03afb1519bb3

## Features

- Responds to Discord interactions (commands, buttons, select menus, modals).
- Reads from and writes to Google Sheets.
- Minimal setup to demonstrate Discord ↔ Google Sheets integration.

## Prerequisites

- Node.js >= 18
- pnpm
- Discord Bot Token
- Google Sheets ID
- Google Apps Script

## Installation

```bash
# Clone the repository
git clone https://github.com/carljkt/discord-google-sheets-bot
cd discord-google-sheets-bot

# Install dependencies
pnpm install
```

## Configuration

1. Create a `.env` file in the root directory:

```env
# DISCORD
DISCORD_TOKEN=your_discord_bot_token
DEV_SERVER_ID=your_guild_id
APPLICATION_ID=your_discord_client_id

# GOOGLE
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="your_private_key"
```

> Make sure to replace newline characters in `GOOGLE_PRIVATE_KEY` with `\n` if using multiline keys.

2. Create a `config.json` file in the root directory:

```json
{
	"AUTO_VERIFY": false,
	"VERIFIED_ROLE_ID": "",
	"UNVERIFIED_ROLE_ID": "",
	"LOGS_CHANNEL_ID": "",
	"LOGS_WEBHOOK_URL": "",
	"GOOGLE_SHEET_ID": ""
}
```

## Usage

1. Build the project:

```bash
pnpm build
```

2. Deploy the slash commands:

```bash
pnpm deploy
```

3. Start the bot:

```bash
pnpm start
```

## Project Structure

```
.
├─ src/
│  ├─ actions/          # Buttons, modals, select menus actions
│  ├─ commands/         # Discord slash command handlers
│  ├─ events/           # Discord event handlers
│  ├─ components/       # Reusable Discord components (embeds, buttons, menus)
│  ├─ handlers/         # Discord component interaction handlers (buttons, modals, menus)
│  ├─ services/         # External services
│  ├─ types/            # Custom TypeScript type definitions
│  ├─ util/             # Utility scripts
│  └─ index.ts          # Bot entry point
├─ dist/                # Compiled JS output
├─ scripts/             # Google Apps Script files (.gs)
├─ .env
├─ config.json
├─ package.json
└─ tsconfig.json
```

## License

Licensed under the [MIT License](LICENSE.md).
