import { Events } from 'discord.js';
import type { Event } from './index.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(_client, client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// Sync config from google sheet and config.json
	},
} satisfies Event<Events.ClientReady>;
