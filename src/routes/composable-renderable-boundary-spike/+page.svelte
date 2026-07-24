<script lang="ts">
	import type { Snippet } from 'svelte';

	import {
		childedComposedComponent,
		componentRenderable,
		composedComponent,
		htmlRenderable,
		snippetRenderable,
		voidComposedComponent
	} from '$lib/engine/ui-infra/composable-renderable';

	import TestComponent from '$lib/engine/ui-infra/composable-renderable/TestComponent.svelte';
	import BoundaryRenderer from './BoundaryRenderer.svelte';

	let revision = $state(0);
</script>

<svelte:head>
	<title>Composable renderable boundary spike</title>
</svelte:head>

{#snippet content()}
	<span>Revision {revision}</span>
{/snippet}

{#snippet testSnippet(
	props: { label: string },
	injected?: Snippet
)}
	<div>
		<strong>{props.label}</strong>
		{@render injected?.()}
	</div>
{/snippet}

{#if true}
	{@const html = childedComposedComponent(
		htmlRenderable('button'),
		{
			type: 'button',
			onclick: () => {
				revision += 1;
			}
		},
		content
	)}

	{@const input = voidComposedComponent(
		htmlRenderable('input'),
		{
			placeholder: `Revision ${revision}`
		}
	)}

	{@const component = composedComponent(
		componentRenderable(TestComponent),
		{
			label: 'Component',
			count: revision
		},
		content
	)}

	{@const snippet = composedComponent(
		snippetRenderable(testSnippet),
		{
			label: 'Snippet'
		},
		content
	)}

	<main>
		<h1>Boundary spike</h1>

		<BoundaryRenderer composedComponent={html} />
		<BoundaryRenderer composedComponent={input} />
		<BoundaryRenderer composedComponent={component} />
		<BoundaryRenderer composedComponent={snippet} />
	</main>
{/if}

<style>
	main {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
	}
</style>
