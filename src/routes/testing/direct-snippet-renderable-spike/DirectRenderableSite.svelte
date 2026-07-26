<script lang="ts" generics="TRenderable extends RenderableInput">
	import type { Snippet } from 'svelte';

	import {
		ComposedComponent,
		type AnyRenderable,
		type RenderableProps
	} from '$lib/engine/ui-infra/composable-renderable';

	import type {
		DirectRenderableSiteProps,
		RenderableInput
	} from './candidate-types';

	let publicProps: DirectRenderableSiteProps<TRenderable> = $props();

	const runtimeProps = $derived(
		publicProps as unknown as {
			renderable: RenderableInput;
			props?: RenderableProps;
			content?: Snippet;
		}
	);

	const resolvedProps = $derived(runtimeProps.props ?? {});

	const directSnippet = $derived(
		typeof runtimeProps.renderable === 'function'
			? (runtimeProps.renderable as Snippet<
					[props: RenderableProps, content?: Snippet]
				>)
			: undefined
	);

	const descriptor = $derived(
		typeof runtimeProps.renderable === 'function'
			? undefined
			: (runtimeProps.renderable as AnyRenderable)
	);
</script>

{#if directSnippet}
	{@render directSnippet(resolvedProps, runtimeProps.content)}
{:else if descriptor}
	<ComposedComponent
		renderable={descriptor}
		props={resolvedProps}
		content={runtimeProps.content}
	/>
{/if}
