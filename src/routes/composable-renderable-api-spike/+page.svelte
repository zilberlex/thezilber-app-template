<script lang="ts">
	import type { Snippet } from 'svelte';
	import RenderableSite from './RenderableSite.svelte';
	import TestComponent from './TestComponent.svelte';
	import {
		componentRenderable,
		contentlessSurface,
		htmlRenderable,
		optionalSurface,
		requiredSurface,
		snippetRenderable
	} from './candidate-api';

	let clicks = $state(0);

	const buttonRenderable = htmlRenderable('button');
	const component = componentRenderable(TestComponent);
</script>

{#snippet content()}
	<em>Injected content</em>
{/snippet}

{#snippet cardSnippet(props: { label: string }, childContent: Snippet)}
	<article>
		<strong>{props.label}</strong>
		{@render childContent()}
	</article>
{/snippet}

<svelte:head>
	<title>Composable renderable API spike</title>
</svelte:head>

<main>
	<h1>Composable renderable API spike</h1>
	<p>Button clicks: {clicks}</p>

	<RenderableSite
		surface={contentlessSurface(buttonRenderable, {
			type: 'button',
			onclick: () => (clicks += 1)
		})}
	/>

	<RenderableSite
		surface={optionalSurface(
			component,
			{
				label: 'Component surface',
				count: clicks
			},
			content
		)}
	/>

	<RenderableSite
		surface={requiredSurface(
			snippetRenderable(cardSnippet),
			{ label: 'Snippet surface' },
			content
		)}
	/>
</main>

<style>
	main {
		display: grid;
		gap: 1rem;
		max-width: 50rem;
		margin: 0 auto;
		padding: 2rem;
	}
</style>
