<script lang="ts" generics="TRenderable extends AnyRenderable">
	import type { Snippet } from 'svelte';

	import type { AnyRenderable, ComposedComponentProps, RenderableProps } from './types';

	import { assertRenderableContent, assertRenderableProps } from './composable-renderable-runtime';

	import ComponentRenderableSite from './ComponentRenderableSite.svelte';
	import HTMLRenderableSite from './HTMLRenderableSite.svelte';
	import SnippetRenderableSite from './SnippetRenderableSite.svelte';

	let publicProps: ComposedComponentProps<TRenderable> = $props();

	const runtimeProps = $derived(
		publicProps as unknown as {
			renderable: AnyRenderable;
			props: RenderableProps;
			content?: Snippet;
		}
	);

	const validatedProps = $derived.by(() => {
		assertRenderableProps(runtimeProps.props);
		assertRenderableContent(runtimeProps.renderable, runtimeProps.content);

		return runtimeProps.props;
	});
</script>

{#if runtimeProps.renderable.kind === 'html'}
	<HTMLRenderableSite renderable={runtimeProps.renderable} props={validatedProps} content={runtimeProps.content} />
{:else if runtimeProps.renderable.kind === 'component'}
	<ComponentRenderableSite renderable={runtimeProps.renderable} props={validatedProps} content={runtimeProps.content} />
{:else}
	<SnippetRenderableSite renderable={runtimeProps.renderable} props={validatedProps} content={runtimeProps.content} />
{/if}
