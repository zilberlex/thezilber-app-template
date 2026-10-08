import type { Component } from 'svelte';

import type {
	ChildedHTMLTag,
	ComponentRenderable,
	HTMLRenderable,
	RenderableProps,
	RenderableSnippet,
	SnippetRenderable,
	VoidHTMLRenderable,
	VoidHTMLTag
} from './types';

const voidHTMLTags = new Set<string>([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]);

export function htmlRenderable<Tag extends VoidHTMLTag>(tag: Tag): VoidHTMLRenderable<Tag>;

export function htmlRenderable<Tag extends ChildedHTMLTag>(tag: Tag): HTMLRenderable<Tag>;

export function htmlRenderable(tag: string): HTMLRenderable<any> | VoidHTMLRenderable<any> {
	if (voidHTMLTags.has(tag)) {
		return {
			kind: 'html',
			htmlContentMode: 'void',
			tag
		};
	}

	return {
		kind: 'html',
		htmlContentMode: 'children',
		tag
	};
}

export function componentRenderable<Props extends RenderableProps>(
	component: Component<Props>
): ComponentRenderable<Props> {
	return {
		kind: 'component',
		component
	};
}

export function snippetRenderable<Props extends RenderableProps>(
	snippet: RenderableSnippet<Props>
): SnippetRenderable<Props> {
	return {
		kind: 'snippet',
		snippet
	};
}
