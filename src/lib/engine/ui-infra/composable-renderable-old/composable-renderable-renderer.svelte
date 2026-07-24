<script module lang="ts">
	import type { Component, Snippet } from 'svelte';

	import {
		isComponentRenderable,
		isHTMLRenderable,
		type AnyRenderable,
		type AnyRenderableProps,
		type HTMLTag,
		type RenderableSnippet
	} from './types';

	export { renderRenderable };

	type ErasedRenderableSnippet = RenderableSnippet<AnyRenderableProps>;

	type ErasedRenderableComponent = Component<
		AnyRenderableProps & {
			children?: Snippet;
		}
	>;

	type ResolvedRenderable =
		| {
				kind: 'element';
				tag: HTMLTag;
		  }
		| {
				kind: 'component';
				component: ErasedRenderableComponent;
		  }
		| {
				kind: 'snippet';
				snippet: ErasedRenderableSnippet;
		  };

	type RenderRenderableArguments = {
		renderable: AnyRenderable;
		renderableProps: AnyRenderableProps;
		content?: Snippet;
	};

	function resolveRenderable(renderable: AnyRenderable): ResolvedRenderable {
		if (typeof renderable === 'string') {
			return {
				kind: 'element',
				tag: renderable as HTMLTag
			};
		}

		if (isHTMLRenderable(renderable)) {
			return {
				kind: 'element',
				tag: renderable.html
			};
		}

		if (isComponentRenderable(renderable)) {
			return {
				kind: 'component',
				component: renderable.component as ErasedRenderableComponent
			};
		}

		if (typeof renderable === 'function') {
			return {
				kind: 'snippet',
				snippet: renderable as ErasedRenderableSnippet
			};
		}

		throw new TypeError(
			`renderRenderable: expected an HTML tag, renderable descriptor, or snippet; received ${describeValue(renderable)}.`
		);
	}

	function describeValue(value: unknown): string {
		if (value === undefined) return 'undefined';
		if (value === null) return 'null';

		if (typeof value === 'object') {
			return Object.prototype.toString.call(value);
		}

		return `${typeof value} (${String(value)})`;
	}
</script>

{#snippet renderRenderable({ renderable, renderableProps, content }: RenderRenderableArguments)}
	{@const resolved = resolveRenderable(renderable)}

	{#if resolved.kind === 'element'}
		<svelte:element this={resolved.tag} {...renderableProps}>
			{#if content}
				{@render content()}
			{/if}
		</svelte:element>
	{:else if resolved.kind === 'component'}
		{@const RenderableComponent = resolved.component}

		<RenderableComponent {...renderableProps} {...content ? { children: content } : {}} />
	{:else}
		{@render resolved.snippet({
			props: renderableProps,
			content
		})}
	{/if}
{/snippet}
