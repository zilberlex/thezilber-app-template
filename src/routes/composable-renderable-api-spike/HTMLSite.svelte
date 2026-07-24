<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tag,
		elementProps,
		content
	}: {
		tag: string;
		elementProps: Record<string, any>;
		content?: Snippet;
	} = $props();
</script>

<svelte:element this={tag} {...elementProps}>
	{@render content?.()}
</svelte:element>
