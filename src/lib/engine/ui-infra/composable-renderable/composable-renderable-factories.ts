import type { Component, Snippet } from 'svelte';
import type {
	AnyComposedComponent,
	ChildedComposedComponent,
	ChildedHTMLRenderable,
	ChildedHTMLTag,
	ComposedComponent,
	ComponentRenderable,
	ExternalHTMLProps,
	HTMLRenderable,
	HTMLTag,
	PropsOf,
	SnippetRenderable,
	VoidComposedComponent,
	VoidHTMLRenderable,
	VoidHTMLTag
} from './composable-renderable';

const VOID_HTML_TAGS: ReadonlySet<string> = new Set([
	'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
]);

export function htmlRenderable<const Tag extends VoidHTMLTag>(tag: Tag): VoidHTMLRenderable<Tag>;
export function htmlRenderable<const Tag extends ChildedHTMLTag>(tag: Tag): ChildedHTMLRenderable<Tag>;
export function htmlRenderable<const Tag extends HTMLTag>(tag: Tag): HTMLRenderable<Tag> {
	if (VOID_HTML_TAGS.has(tag)) {
		return { kind: 'html', htmlContentMode: 'void', tag } as HTMLRenderable<Tag>;
	}
	return { kind: 'html', htmlContentMode: 'children', tag } as HTMLRenderable<Tag>;
}

export function componentRenderable<const C extends Component<any>>(component: C): ComponentRenderable<C> {
	return { kind: 'component', component };
}

export function snippetRenderable<const S extends Snippet<any>>(snippet: S): SnippetRenderable<S> {
	return { kind: 'snippet', snippet };
}

export function composedComponent<const Tag extends ChildedHTMLTag>(
	renderable: ChildedHTMLRenderable<Tag>, props: NoInfer<ExternalHTMLProps<Tag>>, content?: Snippet
): ComposedComponent<ChildedHTMLRenderable<Tag>>;
export function composedComponent<const C extends Component<any>>(
	renderable: ComponentRenderable<C>, props: NoInfer<PropsOf<ComponentRenderable<C>>>, content?: Snippet
): ComposedComponent<ComponentRenderable<C>>;
export function composedComponent<const S extends Snippet<any>>(
	renderable: SnippetRenderable<S>, props: NoInfer<PropsOf<SnippetRenderable<S>>>, content?: Snippet
): ComposedComponent<SnippetRenderable<S>>;
export function composedComponent(renderable: unknown, props: unknown, content?: Snippet): any {
	return content === undefined
		? { kind: 'composed-component', renderable, props }
		: { kind: 'composed-component', renderable, props, content };
}

export function voidComposedComponent<const Tag extends VoidHTMLTag>(
	renderable: VoidHTMLRenderable<Tag>, props: NoInfer<ExternalHTMLProps<Tag>>
): VoidComposedComponent<VoidHTMLRenderable<Tag>>;
export function voidComposedComponent<const C extends Component<any>>(
	renderable: ComponentRenderable<C>, props: NoInfer<PropsOf<ComponentRenderable<C>>>
): VoidComposedComponent<ComponentRenderable<C>>;
export function voidComposedComponent<const S extends Snippet<any>>(
	renderable: SnippetRenderable<S>, props: NoInfer<PropsOf<SnippetRenderable<S>>>
): VoidComposedComponent<SnippetRenderable<S>>;
export function voidComposedComponent(renderable: unknown, props: unknown): any {
	return { kind: 'void-composed-component', renderable, props };
}

export function childedComposedComponent<const Tag extends ChildedHTMLTag>(
	renderable: ChildedHTMLRenderable<Tag>, props: NoInfer<ExternalHTMLProps<Tag>>, content: Snippet
): ChildedComposedComponent<ChildedHTMLRenderable<Tag>>;
export function childedComposedComponent<const C extends Component<any>>(
	renderable: ComponentRenderable<C>, props: NoInfer<PropsOf<ComponentRenderable<C>>>, content: Snippet
): ChildedComposedComponent<ComponentRenderable<C>>;
export function childedComposedComponent<const S extends Snippet<any>>(
	renderable: SnippetRenderable<S>, props: NoInfer<PropsOf<SnippetRenderable<S>>>, content: Snippet
): ChildedComposedComponent<SnippetRenderable<S>>;
export function childedComposedComponent(renderable: unknown, props: unknown, content: Snippet): any {
	return { kind: 'childed-composed-component', renderable, props, content };
}

export function composedComponents<const Components extends readonly AnyComposedComponent[]>(
	...components: Components
): Components {
	return components;
}
