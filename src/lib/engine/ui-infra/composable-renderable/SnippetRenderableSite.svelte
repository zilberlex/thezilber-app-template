<script lang="ts">
	import type { Snippet } from 'svelte';
	let { snippet, snippetProps, content }: {
		snippet: Snippet<any>;
		snippetProps: Record<string, any>;
		content?: Snippet;
	} = $props();
	const CurrentSnippet = $derived(snippet as Snippet<[Record<string, any>, Snippet?]>);
</script>

{#if content}
	{@render CurrentSnippet(snippetProps, content)}
{:else}
	{@render CurrentSnippet(snippetProps)}
{/if}
