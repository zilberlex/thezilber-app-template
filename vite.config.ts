import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import './vite-plugins/scss-globals.plugin';
import { scssGlobals } from './vite-plugins/scss-globals.plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		scssGlobals({
			modules: ['src/lib/ui/style/utility/utility', 'src/lib/ui/style/effects'],
			exclude: ['/src/lib/ui/style/']
		})
	]
});
