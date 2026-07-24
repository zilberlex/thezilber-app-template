import type { Component, Snippet } from 'svelte';

export type BoundaryHTMLRenderable = {
	kind: 'html';
	tag: string;
};

export type BoundaryComponentRenderable = {
	kind: 'component';
	component: Component<any>;
};

export type BoundarySnippetRenderable = {
	kind: 'snippet';
	snippet: Snippet<any>;
};

export type BoundaryRenderable =
	| BoundaryHTMLRenderable
	| BoundaryComponentRenderable
	| BoundarySnippetRenderable;

export type BoundaryComposedComponent = {
	kind:
		| 'composed-component'
		| 'void-composed-component'
		| 'childed-composed-component';
	renderable: BoundaryRenderable;
	props: unknown;
	content?: Snippet;
};

export type BoundaryRendererProps = {
	composedComponent: BoundaryComposedComponent;
	invocationProps?: Record<string, any>;
};
