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

export type HTMLRenderable<Tag extends HTMLTag> = {
	kind: 'html';
	tag: Tag;
};

export type ComponentRenderable<C extends Component<any>> = {
	kind: 'component';
	component: C;
};

export type SnippetRenderable<S extends Snippet<any>> = {
	kind: 'snippet';
	snippet: S;
};

export type AnyRenderable =
	| HTMLRenderable<HTMLTag>
	| ComponentRenderable<Component<any>>
	| SnippetRenderable<Snippet<any>>;

type ExternalProps<Props> = Omit<Props, 'children'>;

type SnippetFirstArgument<S extends Snippet<any>> =
	S extends Snippet<infer Arguments>
		? Arguments extends [infer Props, ...unknown[]]
			? Props
			: Record<never, never>
		: never;

export type PropsOf<Renderable extends AnyRenderable> =
	Renderable extends HTMLRenderable<infer Tag>
		? ExternalHTMLProps<Tag>
		: Renderable extends ComponentRenderable<infer C>
			? ExternalProps<ComponentProps<C>>
			: Renderable extends SnippetRenderable<infer S>
				? ExternalProps<SnippetFirstArgument<S>>
				: never;

export type ComposedComponent<Renderable extends AnyRenderable> = {
	kind: 'composed-component';
	renderable: Renderable;
	props: PropsOf<Renderable>;
	content?: Snippet;
};

export type VoidComposedComponent<Renderable extends AnyRenderable> = {
	kind: 'void-composed-component';
	renderable: Renderable;
	props: PropsOf<Renderable>;
};

export type ChildedComposedComponent<Renderable extends AnyRenderable> = {
	kind: 'childed-composed-component';
	renderable: Renderable;
	props: PropsOf<Renderable>;
	content: Snippet;
};

export type AnyComposedComponent<Renderable extends AnyRenderable = AnyRenderable> =
	| ComposedComponent<Renderable>
	| VoidComposedComponent<Renderable>
	| ChildedComposedComponent<Renderable>;

export function htmlRenderable<const Tag extends HTMLTag>(tag: Tag): HTMLRenderable<Tag> {
	return {
		kind: 'html',
		tag
	};
}

export function componentRenderable<const C extends Component<any>>(component: C): ComponentRenderable<C> {
	return {
		kind: 'component',
		component
	};
}

export function snippetRenderable<const S extends Snippet<any>>(snippet: S): SnippetRenderable<S> {
	return {
		kind: 'snippet',
		snippet
	};
}

function normalizeRenderable(renderable: HTMLTag | AnyRenderable): AnyRenderable {
	return typeof renderable === 'string' ? htmlRenderable(renderable) : renderable;
}

export function composedComponent<const Tag extends ChildedHTMLTag>(
	renderable: Tag,
	props: NoInfer<ExternalHTMLProps<Tag>>,
	content?: Snippet
): ComposedComponent<HTMLRenderable<Tag>>;

export function composedComponent<Renderable extends AnyRenderable>(
	renderable: Renderable,
	props: NoInfer<PropsOf<Renderable>>,
	content?: Snippet
): ComposedComponent<Renderable>;

export function composedComponent(
	renderable: HTMLTag | AnyRenderable,
	props: object,
	content?: Snippet
): ComposedComponent<any> {
	return {
		kind: 'composed-component',
		renderable: normalizeRenderable(renderable),
		props,
		...(content ? { content } : {})
	};
}

export function voidComposedComponent<const Tag extends VoidHTMLTag>(
	renderable: Tag,
	props: NoInfer<ExternalHTMLProps<Tag>>
): VoidComposedComponent<HTMLRenderable<Tag>>;

export function voidComposedComponent<Renderable extends AnyRenderable>(
	renderable: Renderable,
	props: NoInfer<PropsOf<Renderable>>
): VoidComposedComponent<Renderable>;

export function voidComposedComponent(renderable: HTMLTag | AnyRenderable, props: object): VoidComposedComponent<any> {
	return {
		kind: 'void-composed-component',
		renderable: normalizeRenderable(renderable),
		props
	};
}

export function childedComposedComponent<const Tag extends ChildedHTMLTag>(
	renderable: Tag,
	props: NoInfer<ExternalHTMLProps<Tag>>,
	content: Snippet
): ChildedComposedComponent<HTMLRenderable<Tag>>;

export function childedComposedComponent<Renderable extends AnyRenderable>(
	renderable: Renderable,
	props: NoInfer<PropsOf<Renderable>>,
	content: Snippet
): ChildedComposedComponent<Renderable>;

export function childedComposedComponent(
	renderable: HTMLTag | AnyRenderable,
	props: object,
	content: Snippet
): ChildedComposedComponent<any> {
	return {
		kind: 'childed-composed-component',
		renderable: normalizeRenderable(renderable),
		props,
		content
	};
}
