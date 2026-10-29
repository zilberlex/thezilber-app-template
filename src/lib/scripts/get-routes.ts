export function getRoutes(): string[] {
	const modules = import.meta.glob('/src/routes/**/+page.svelte');

	return Object.keys(modules)
		.map((path) => path.replace('/src/routes', '').replace('/+page.svelte', '') || '/')
		.filter((route) => !/\[[^/]+\]/.test(route))
		.sort();
}
