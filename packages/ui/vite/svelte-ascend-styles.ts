import type { Plugin } from 'vite';

import { scssGlobals } from './scss-globals.js';

export function svelteAscendStyles(): Plugin {
	return scssGlobals({
		modules: ['@svelte-ascend/ui/style/utility', '@svelte-ascend/ui/style/effects']
	});
}
