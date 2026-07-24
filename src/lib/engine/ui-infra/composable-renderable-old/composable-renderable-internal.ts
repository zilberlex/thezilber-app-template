import type { Component, ComponentProps } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

/**
 * Removes string, number, and symbol index signatures while preserving
 * explicitly declared properties.
 */
export type RemoveIndexSignature<Shape> = {
	[Key in keyof Shape as string extends Key
		? never
		: number extends Key
			? never
			: symbol extends Key
				? never
				: Key]: Shape[Key];
};

/**
 * SvelteHTMLElements has a catch-all string index signature for custom
 * elements. Removing it gives us the concrete built-in HTML tag union.
 */
export type InternalHTMLTag = Extract<keyof RemoveIndexSignature<SvelteHTMLElements>, string>;

export type InternalVoidHTMLTag =
	| 'area'
	| 'base'
	| 'br'
	| 'col'
	| 'embed'
	| 'hr'
	| 'img'
	| 'input'
	| 'link'
	| 'meta'
	| 'param'
	| 'source'
	| 'track'
	| 'wbr';

export type InternalSurfaceHTMLTag = Exclude<InternalHTMLTag, InternalVoidHTMLTag>;

export type InternalContentMode = 'required' | 'optional';

/**
 * Required-content renderables cannot use void HTML elements.
 */
export type HTMLTagForMode<Mode extends InternalContentMode> = Mode extends 'required'
	? InternalSurfaceHTMLTag
	: InternalHTMLTag;

export type WithoutChildren<Props> = Omit<Props, 'children'>;

/**
 * Distributes over tag unions one tag at a time.
 *
 * Performing Omit directly on SvelteHTMLElements[AllTags] can create a union
 * too complex for TypeScript to represent.
 */
export type HTMLTagProps<Tag extends InternalHTMLTag> = Tag extends InternalHTMLTag
	? WithoutChildren<SvelteHTMLElements[Tag]>
	: never;

/**
 * Checks whether a component accepts a zero-argument Svelte Snippet through
 * its children prop.
 */
export type AcceptsChildren<RenderableComponent extends Component<any>> =
	'children' extends keyof ComponentProps<RenderableComponent>
		? import('svelte').Snippet extends NonNullable<ComponentProps<RenderableComponent>['children']>
			? unknown
			: never
		: never;
