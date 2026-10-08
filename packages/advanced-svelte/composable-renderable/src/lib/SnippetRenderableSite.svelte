<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RenderableProps, SnippetRenderable } from './types';

	let {
		renderable,
		props,
		content
	}: {
		renderable: SnippetRenderable<any>;
		props: RenderableProps;
		content?: Snippet;
	} = $props();
</script>

{@render renderable.snippet(props, content)}
