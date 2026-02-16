import type { Page } from '@sveltejs/kit';

function escapeRegex(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getBasePath(page: Page, trimmedSuffix: string = '[[itemKey]]') {
	let routeId = page.route.id ?? '';

	const suffix = trimmedSuffix.startsWith('/') ? trimmedSuffix : '/' + trimmedSuffix;

	const re = new RegExp(`${escapeRegex(suffix)}$`);

	return routeId
		.replace(re, '') // remove suffix
		.replace(/^\/+/, ''); // remove leading slash
}
