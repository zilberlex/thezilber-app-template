<script lang="ts">
	import type { Snippet } from 'svelte';
	let { tag, elementProps, content }: {
		tag: string;
		elementProps: Record<string, any>;
		content?: Snippet;
	} = $props();
</script>

{#if content}
	<svelte:element this={tag} {...elementProps}>{@render content()}</svelte:element>
{:else}
	<svelte:element this={tag} {...elementProps} />
{/if}
