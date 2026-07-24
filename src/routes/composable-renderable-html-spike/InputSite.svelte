<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	let {
		elementProps,
		element = $bindable()
	}: {
		elementProps: Omit<SvelteHTMLElements['input'], 'children'>;
		element?: HTMLInputElement;
	} = $props();
</script>

<input {...elementProps} bind:this={element} />
