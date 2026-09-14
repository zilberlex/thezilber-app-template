<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	import '../style/base.css';

	let {
		theme: Theme,
		extensions = [],
		children
	}: {
		theme: Component;
		extensions?: Component[];
		children?: Snippet;
	} = $props();
</script>

<Theme />

{#each extensions as Extension}
	<Extension />
{/each}

{@render children?.()}
