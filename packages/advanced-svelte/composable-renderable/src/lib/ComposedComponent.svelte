<script lang="ts" generics="TRenderable extends AnyRenderable">
	import type { Snippet } from 'svelte';

	import type {
		AnyRenderable,
		ComposedComponentProps,
		ExplicitRenderable,
		RenderableProps,
		RenderableSnippet
	} from './types';

	import { assertRenderableContent, assertRenderableProps } from './composable-renderable-runtime';

	import ComponentRenderableSite from './ComponentRenderableSite.svelte';
	import HTMLRenderableSite from './HTMLRenderableSite.svelte';
	import SnippetRenderableSite from './SnippetRenderableSite.svelte';

	let publicProps: ComposedComponentProps<TRenderable> = $props();

	const runtimeProps = $derived(
		publicProps as unknown as {
			renderable: AnyRenderable;
			props?: RenderableProps;
			content?: Snippet;
		}
	);

	const validatedProps = $derived.by(() => {
		const props = runtimeProps.props ?? {};

		assertRenderableProps(props);

		if (typeof runtimeProps.renderable !== 'function') {
			assertRenderableContent(runtimeProps.renderable, runtimeProps.content);
		}

		return props;
	});

	const directSnippet = $derived(
		typeof runtimeProps.renderable === 'function' ? (runtimeProps.renderable as RenderableSnippet) : undefined
	);

	const explicitRenderable = $derived(
		typeof runtimeProps.renderable === 'function' ? undefined : (runtimeProps.renderable as ExplicitRenderable)
	);
</script>

{#if directSnippet}
	{@render directSnippet(validatedProps, runtimeProps.content)}
{:else if explicitRenderable?.kind === 'html'}
	<HTMLRenderableSite renderable={explicitRenderable} props={validatedProps} content={runtimeProps.content} />
{:else if explicitRenderable?.kind === 'component'}
	<ComponentRenderableSite renderable={explicitRenderable} props={validatedProps} content={runtimeProps.content} />
{:else if explicitRenderable}
	<SnippetRenderableSite renderable={explicitRenderable} props={validatedProps} content={runtimeProps.content} />
{/if}
