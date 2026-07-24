<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		childedComposedComponent,
		componentRenderable,
		composedComponent,
		ComposedComponentRenderer,
		htmlRenderable,
		snippetRenderable,
		voidComposedComponent
	} from '$lib/engine/ui-infra/composable-renderable';
	import AlternatePanel from './AlternatePanel.svelte';
	import StatefulPanel from './StatefulPanel.svelte';
	let revision = $state(0);
	let invocationDisabled = $state(true);
	let useAlternateComponent = $state(false);
	let useDiv = $state(false);
</script>

<svelte:head><title>Composed component renderer spike</title></svelte:head>

{#snippet buttonContent()}Save revision {revision}{/snippet}
{#snippet panelContent()}<strong>Injected panel content: {revision}</strong>{/snippet}
{#snippet rowSnippet(props: { label: string; revision: number }, content?: Snippet)}
	<div class="snippet-row"><span>{props.label}: {props.revision}</span>{@render content?.()}</div>
{/snippet}
{#snippet rowContent()}<em>Injected snippet content</em>{/snippet}

{#if true}
	{@const button = childedComposedComponent(htmlRenderable('button'), { type: 'button', disabled: false, onclick: () => { revision += 1; } }, buttonContent)}
	{@const input = voidComposedComponent(htmlRenderable('input'), { placeholder: `Revision ${revision}`, 'data-revision': revision })}
	{@const panel = useAlternateComponent
		? composedComponent(componentRenderable(AlternatePanel), { label: 'Alternate component', revision }, panelContent)
		: composedComponent(componentRenderable(StatefulPanel), { label: 'Stateful component', revision }, panelContent)}
	{@const row = composedComponent(snippetRenderable(rowSnippet), { label: 'Typed snippet', revision }, rowContent)}
	{@const switchingHTML = useDiv
		? childedComposedComponent(htmlRenderable('div'), { 'data-identity-test': true }, buttonContent)
		: childedComposedComponent(htmlRenderable('button'), { 'data-identity-test': true, type: 'button' }, buttonContent)}

	<main>
		<header><h1>Composed component renderer spike</h1><div class="controls">
			<button type="button" onclick={() => (revision += 1)}>Update revision ({revision})</button>
			<button type="button" onclick={() => (invocationDisabled = !invocationDisabled)}>Invocation disabled: {invocationDisabled}</button>
			<button type="button" onclick={() => (useAlternateComponent = !useAlternateComponent)}>Switch component identity</button>
			<button type="button" onclick={() => (useDiv = !useDiv)}>Switch HTML identity</button>
		</div></header>

		<section><h2>Childed HTML renderable</h2><p>Composition sets <code>disabled: false</code>. Invocation sets <code>disabled: {String(invocationDisabled)}</code>. Composition must win.</p>
			<ComposedComponentRenderer composedComponent={button} invocationProps={{ disabled: invocationDisabled, title: 'Invocation title' }} />
		</section>
		<section><h2>Void HTML renderable</h2><p>Type a value, then update the revision. The input value and focus must remain.</p><ComposedComponentRenderer composedComponent={input} /></section>
		<section><h2>Component renderable</h2><p>Increment local state, then update the revision. Local state must remain until the actual component identity changes.</p>
			<ComposedComponentRenderer composedComponent={panel} invocationProps={{ label: 'Invocation label' }} />
		</section>
		<section><h2>Snippet renderable</h2><ComposedComponentRenderer composedComponent={row} invocationProps={{ label: 'Invocation snippet label' }} /></section>
		<section><h2>HTML identity switching</h2><p>This switches the actual rendered tag between <code>button</code> and <code>div</code>.</p><ComposedComponentRenderer composedComponent={switchingHTML} /></section>
	</main>
{/if}

<style>
	:global(body) { margin: 0; font-family: system-ui, sans-serif; }
	main { display: grid; gap: 1rem; max-width: 70rem; margin: 0 auto; padding: 1.5rem; }
	header, section { display: grid; gap: 1rem; }
	section { padding: 1rem; border: 1px solid currentColor; border-radius: 0.75rem; }
	.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	h1, h2, p { margin: 0; }
	:global(.snippet-row) { display: flex; gap: 0.75rem; }
</style>
