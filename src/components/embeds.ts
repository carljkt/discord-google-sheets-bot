import { EmbedBuilder } from 'discord.js';

export function createErrorEmbed({ title, description }: { description: string; title: string }) {
	return new EmbedBuilder().setAuthor({ name: title }).setDescription(description).setColor('Red');
}

export function createSuccessEmbed({ title, description }: { description: string; title: string }) {
	return new EmbedBuilder().setAuthor({ name: title }).setDescription(description).setColor('Green');
}

export function createUnauthorizedEmbed() {
	return createErrorEmbed({
		title: 'Unauthorized Interaction',
		description: `You dont have permission to interact with this component`,
	});
}
