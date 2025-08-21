import process from 'node:process';
import { URL } from 'node:url';
import { API } from '@discordjs/core/http-only';
import type { RESTPutAPIApplicationGuildCommandsJSONBody } from 'discord.js';
import { REST } from 'discord.js';
import { loadCommands } from './loaders.js';

const commands = await loadCommands(new URL('../commands/', import.meta.url));
const commandData = [...commands.values()].map((command) => command.data);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
const api = new API(rest);

const result = await api.applicationCommands.bulkOverwriteGuildCommands(
	process.env.APPLICATION_ID!,
	process.env.DEV_SERVER_ID!,
	commandData as RESTPutAPIApplicationGuildCommandsJSONBody,
);

console.log(`Successfully registered ${result.length} commands.`);
