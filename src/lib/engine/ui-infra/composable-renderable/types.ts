import type { Component, Snippet } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

export type RenderableProps = Record<string, any>;

declare const RENDERABLE_PROPS: unique symbol;

type RenderablePropsCarrier<Props extends RenderableProps> = {
	readonly [RENDERABLE_PROPS]?: Props;
};

export type HTMLTag = Extract<keyof SvelteHTMLElements, string>;

export type VoidHTMLTag =
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

export type ChildedHTMLTag = Exclude<HTMLTag, VoidHTMLTag>;

export type HTMLRenderable<
	Tag extends ChildedHTMLTag = ChildedHTMLTag,
	Props extends RenderableProps = RenderableProps
> = {
	kind: 'html';
	htmlContentMode: 'children';
	tag: Tag;
} & RenderablePropsCarrier<Props>;

export type VoidHTMLRenderable<
	Tag extends VoidHTMLTag = VoidHTMLTag,
	Props extends RenderableProps = RenderableProps
> = {
	kind: 'html';
	htmlContentMode: 'void';
	tag: Tag;
} & RenderablePropsCarrier<Props>;

export type ComponentRenderable<Props extends RenderableProps = RenderableProps> = {
	kind: 'component';
	component: Component<Props>;
} & RenderablePropsCarrier<Omit<Props, 'children'>>;

export type RenderableSnippet<Props extends RenderableProps = RenderableProps> = Snippet<
	[props: Props, content?: Snippet]
>;

export type SnippetRenderable<Props extends RenderableProps = RenderableProps> = {
	kind: 'snippet';
	snippet: RenderableSnippet<Props>;
} & RenderablePropsCarrier<Omit<Props, 'children'>>;

export type AnyHTMLRenderable = HTMLRenderable<any, any> | VoidHTMLRenderable<any, any>;

export type AnyRenderable = AnyHTMLRenderable | ComponentRenderable<any> | SnippetRenderable<any>;

export type ChildCapableRenderable = HTMLRenderable<any, any> | ComponentRenderable<any> | SnippetRenderable<any>;

export type PropsOf<TRenderable extends AnyRenderable> =
	TRenderable extends RenderablePropsCarrier<infer Props> ? Props : never;

type RenderableContentProps<TRenderable extends AnyRenderable> =
	TRenderable extends VoidHTMLRenderable<any, any>
		? {
				content?: never;
			}
		: {
				content?: Snippet;
			};

export type ComposedComponentProps<TRenderable extends AnyRenderable> = {
	renderable: TRenderable;
	props: PropsOf<TRenderable>;
} & RenderableContentProps<TRenderable>;
