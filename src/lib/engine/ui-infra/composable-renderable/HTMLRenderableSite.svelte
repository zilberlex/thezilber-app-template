<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AnyHTMLRenderable, RenderableProps } from './types';

	let {
		renderable,
		props,
		content
	}: {
		renderable: AnyHTMLRenderable;
		props: RenderableProps;
		content?: Snippet;
	} = $props();
</script>

{#if renderable.htmlContentMode === 'void'}
	<svelte:element this={renderable.tag} {...props} />
{:else}
	<svelte:element this={renderable.tag} {...props}>
		{#if content}
			{@render content()}
		{/if}
	</svelte:element>
{/if}
