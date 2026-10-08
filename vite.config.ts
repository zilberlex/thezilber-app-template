import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { svelteAscendStyles } from '@svelte-ascend/ui/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteAscendStyles()]
});
