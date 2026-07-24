<script lang="ts">
	import type { Snippet } from 'svelte';
	import { mergeProps } from 'svelte-toolbelt';

	import type { RuntimeComposedComponent } from './composable-renderable-runtime';

	import ComponentRenderableSite from './ComponentRenderableSite.svelte';
	import HTMLRenderableSite from './HTMLRenderableSite.svelte';
	import SnippetRenderableSite from './SnippetRenderableSite.svelte';

	let {
		composedComponent,
		invocationProps = {}
	}: {
		composedComponent: RuntimeComposedComponent;
		invocationProps?: Record<string, any>;
	} = $props();

	const mergedProps = $derived(mergeProps(invocationProps, composedComponent.props as Record<string, any>));

	const content = $derived(
		composedComponent.kind === 'void-composed-component' ? undefined : composedComponent.content
	);

	const CurrentSnippet = $derived(
		composedComponent.renderable.kind === 'snippet'
			? (composedComponent.renderable.snippet as Snippet<[Record<string, any>, Snippet?]>)
			: undefined
	);
</script>

{#if composedComponent.renderable.kind === 'html'}
	<HTMLRenderableSite tag={composedComponent.renderable.tag} elementProps={mergedProps} {content} />
{:else if composedComponent.renderable.kind === 'component'}
	<ComponentRenderableSite component={composedComponent.renderable.component} componentProps={mergedProps} {content} />
{:else if CurrentSnippet}
	<SnippetRenderableSite snippet={CurrentSnippet} snippetProps={mergedProps} {content} />
{/if}
