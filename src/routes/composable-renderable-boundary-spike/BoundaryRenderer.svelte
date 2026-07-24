<script lang="ts">
	import type { Snippet } from 'svelte';
	import { mergeProps } from 'svelte-toolbelt';

	import type { BoundaryRendererProps } from './boundary-types';

	let {
		composedComponent,
		invocationProps = {}
	}: BoundaryRendererProps = $props();

	const mergedProps = $derived(
		mergeProps(
			invocationProps,
			composedComponent.props as Record<string, any>
		)
	);

	const content = $derived(
		composedComponent.kind === 'void-composed-component'
			? undefined
			: composedComponent.content
	);

	const CurrentSnippet = $derived(
		composedComponent.renderable.kind === 'snippet'
			? composedComponent.renderable.snippet as Snippet<
					[Record<string, any>, Snippet?]
				>
			: undefined
	);
</script>

{#if composedComponent.renderable.kind === 'html'}
	{#if content}
		<svelte:element
			this={composedComponent.renderable.tag}
			{...mergedProps}
		>
			{@render content()}
		</svelte:element>
	{:else}
		<svelte:element
			this={composedComponent.renderable.tag}
			{...mergedProps}
		/>
	{/if}
{:else if composedComponent.renderable.kind === 'component'}
	{@const CurrentComponent = composedComponent.renderable.component}

	{#if content}
		<CurrentComponent {...mergedProps} children={content} />
	{:else}
		<CurrentComponent {...mergedProps} />
	{/if}
{:else if CurrentSnippet}
	{#if content}
		{@render CurrentSnippet(mergedProps, content)}
	{:else}
		{@render CurrentSnippet(mergedProps)}
	{/if}
{/if}
