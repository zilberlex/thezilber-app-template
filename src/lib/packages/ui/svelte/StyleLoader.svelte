<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	import '../style/base.css';

	let {
		theme: Theme,
		extensions = []
	}: {
		theme: Component;
		extensions?: Component[];
	} = $props();
</script>

<Theme />

{#each extensions as Extension}
	<Extension />
{/each}
