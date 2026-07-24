import type { Component, ComponentProps, Snippet } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

export type HTMLTag = keyof HTMLElementTagNameMap | 'param';

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
export type ExternalHTMLProps<Tag extends HTMLTag> = Omit<SvelteHTMLElements[Tag], 'children'>;

export type VoidHTMLRenderable<Tag extends VoidHTMLTag = VoidHTMLTag> = {
	kind: 'html';
	htmlContentMode: 'void';
	tag: Tag;
};

export type ChildedHTMLRenderable<Tag extends ChildedHTMLTag = ChildedHTMLTag> = {
	kind: 'html';
	htmlContentMode: 'children';
	tag: Tag;
};

export type HTMLRenderable<Tag extends HTMLTag = HTMLTag> = Tag extends VoidHTMLTag
	? VoidHTMLRenderable<Tag>
	: Tag extends ChildedHTMLTag
		? ChildedHTMLRenderable<Tag>
		: never;

export type ComponentRenderable<C extends Component<any> = Component<any>> = {
	kind: 'component';
	component: C;
};

export type SnippetRenderable<S extends Snippet<any> = Snippet<any>> = {
	kind: 'snippet';
	snippet: S;
};

export type AnyHTMLRenderable = VoidHTMLRenderable | ChildedHTMLRenderable;
export type AnyRenderable = AnyHTMLRenderable | ComponentRenderable | SnippetRenderable;
export type ChildCapableRenderable = ChildedHTMLRenderable | ComponentRenderable | SnippetRenderable;
export type VoidCapableRenderable = VoidHTMLRenderable | ComponentRenderable | SnippetRenderable;

type ExternalProps<Props> = Omit<Props, 'children'>;
type SnippetFirstArgument<S extends Snippet<any>> = S extends Snippet<infer Arguments>
	? Arguments extends [infer Props, ...unknown[]]
		? Props
		: Record<never, never>
	: never;

export type PropsOf<Renderable extends AnyRenderable> =
	Renderable extends VoidHTMLRenderable<infer Tag>
		? ExternalHTMLProps<Tag>
		: Renderable extends ChildedHTMLRenderable<infer Tag>
			? ExternalHTMLProps<Tag>
			: Renderable extends ComponentRenderable<infer C>
				? ExternalProps<ComponentProps<C>>
				: Renderable extends SnippetRenderable<infer S>
					? ExternalProps<SnippetFirstArgument<S>>
					: never;

export type ComposedComponent<Renderable extends ChildCapableRenderable = ChildCapableRenderable> = {
	kind: 'composed-component';
	renderable: Renderable;
	props: PropsOf<Renderable>;
	content?: Snippet;
};

export type VoidComposedComponent<Renderable extends VoidCapableRenderable = VoidCapableRenderable> = {
	kind: 'void-composed-component';
	renderable: Renderable;
	props: PropsOf<Renderable>;
};

export type ChildedComposedComponent<Renderable extends ChildCapableRenderable = ChildCapableRenderable> = {
	kind: 'childed-composed-component';
	renderable: Renderable;
	props: PropsOf<Renderable>;
	content: Snippet;
};

export type AnyComposedComponent = ComposedComponent | VoidComposedComponent | ChildedComposedComponent;
