import { page } from '$app/state';

function escapeRegex(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getBasePath(trimmedSuffix: string = '[[itemKey]]') {
	let routeId = page.route.id ?? '';

	const suffix = trimmedSuffix.startsWith('/') ? trimmedSuffix : '/' + trimmedSuffix;

	const re = new RegExp(`${escapeRegex(suffix)}$`);

	return routeId
		.replace(re, '') // remove suffix
		.replace(/^\/+/, ''); // remove leading slash
}

export function getContextPath(baseUrlPath: string, itemKey: string) {
	const newUrl = new URL(page.url);
	newUrl.pathname = `${baseUrlPath}/${itemKey}`;

	return newUrl;
}
