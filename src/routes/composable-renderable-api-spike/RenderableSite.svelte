<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import ComponentSite from './ComponentSite.svelte';
	import HTMLSite from './HTMLSite.svelte';
	import SnippetSite from './SnippetSite.svelte';

	type RuntimeSurface = {
		mode: 'children-required' | 'children-optional' | 'no-children';
		renderable:
			| { kind: 'html'; tag: string }
			| { kind: 'component'; component: Component<any> }
			| { kind: 'snippet'; snippet: Snippet<any> };
		props: any;
		content?: Snippet;
	};

	let { surface }: { surface: RuntimeSurface } = $props();
</script>

{#if surface.renderable.kind === 'html'}
	<HTMLSite
		tag={surface.renderable.tag}
		elementProps={surface.props}
		content={surface.content}
	/>
{:else if surface.renderable.kind === 'component'}
	<ComponentSite
		component={surface.renderable.component}
		componentProps={surface.props}
		content={surface.content}
	/>
{:else if surface.content}
	<SnippetSite
		snippet={surface.renderable.snippet}
		snippetProps={surface.props}
		content={surface.content}
	/>
{/if}
