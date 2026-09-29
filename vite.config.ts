import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { scssGlobals } from './vite-plugins/scss-globals.plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		scssGlobals({
			modules: ['packages/ui/style/utility', 'packages/ui/style/effects'],
			exclude: ['packages/ui/style/', 'ui/style']
		})
	]
});
