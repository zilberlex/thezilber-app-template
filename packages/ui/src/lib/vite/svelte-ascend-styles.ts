import type { Plugin } from 'vite';
import { fileURLToPath } from 'node:url';

import { scssGlobals } from './scss-globals.js';

export function svelteAscendStyles(): Plugin {
	const styleDir = fileURLToPath(new URL('../style/', import.meta.url)).replace(/\\/g, '/');

	return scssGlobals({
		modules: ['@advanced-svelte-ascend/ui/style/utility', '@advanced-svelte-ascend/ui/style/effects'],
		exclude: [styleDir, '/node_modules/']
	});
}
