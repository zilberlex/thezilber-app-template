import type { Component, ComponentProps, Snippet } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

export type HTMLTag = Extract<keyof SvelteHTMLElements, string>;

export type ContentMode =
	| 'children-required'
	| 'children-optional'
	| 'no-children';

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
		? ExternalProps<SvelteHTMLElements[Tag]>
		: Renderable extends ComponentRenderable<infer C>
			? ExternalProps<ComponentProps<C>>
			: Renderable extends SnippetRenderable<infer S>
				? ExternalProps<SnippetFirstArgument<S>>
				: never;

export type RequiredSurface<Renderable extends AnyRenderable> = {
	mode: 'children-required';
	renderable: Renderable;
	props: PropsOf<Renderable>;
	content: Snippet;
};

export type OptionalSurface<Renderable extends AnyRenderable> = {
	mode: 'children-optional';
	renderable: Renderable;
	props: PropsOf<Renderable>;
	content?: Snippet;
};

export type ContentlessSurface<Renderable extends AnyRenderable> = {
	mode: 'no-children';
	renderable: Renderable;
	props: PropsOf<Renderable>;
};

export type Surface<Renderable extends AnyRenderable = AnyRenderable> =
	| RequiredSurface<Renderable>
	| OptionalSurface<Renderable>
	| ContentlessSurface<Renderable>;

export function htmlRenderable<const Tag extends HTMLTag>(
	tag: Tag
): HTMLRenderable<Tag> {
	return { kind: 'html', tag };
}

export function componentRenderable<const C extends Component<any>>(
	component: C
): ComponentRenderable<C> {
	return { kind: 'component', component };
}

export function snippetRenderable<const S extends Snippet<any>>(
	snippet: S
): SnippetRenderable<S> {
	return { kind: 'snippet', snippet };
}

export function requiredSurface<Renderable extends AnyRenderable>(
	renderable: Renderable,
	props: NoInfer<PropsOf<Renderable>>,
	content: Snippet
): RequiredSurface<Renderable> {
	return {
		mode: 'children-required',
		renderable,
		props,
		content
	};
}

export function optionalSurface<Renderable extends AnyRenderable>(
	renderable: Renderable,
	props: NoInfer<PropsOf<Renderable>>,
	content?: Snippet
): OptionalSurface<Renderable> {
	return {
		mode: 'children-optional',
		renderable,
		props,
		...(content ? { content } : {})
	};
}

export function contentlessSurface<Renderable extends AnyRenderable>(
	renderable: Renderable,
	props: NoInfer<PropsOf<Renderable>>
): ContentlessSurface<Renderable> {
	return {
		mode: 'no-children',
		renderable,
		props
	};
}
