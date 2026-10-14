<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children
	}: {
		label: string;
		children?: Snippet;
	} = $props();

	let count = $state(0);
</script>

<button type="button" onclick={() => count++}>
	{label}: {count}

	{#if children}
		{@render children()}
	{/if}
</button>
