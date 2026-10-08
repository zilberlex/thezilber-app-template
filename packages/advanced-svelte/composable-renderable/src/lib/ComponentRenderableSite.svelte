<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ComponentRenderable, RenderableProps } from './types';

	let {
		renderable,
		props,
		content
	}: {
		renderable: ComponentRenderable<any>;
		props: RenderableProps;
		content?: Snippet;
	} = $props();

	const Component = $derived(renderable.component);
</script>

{#if content}
	<Component {...props} children={content} />
{:else}
	<Component {...props} />
{/if}
