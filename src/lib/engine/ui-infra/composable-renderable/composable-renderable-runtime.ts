import type { Component, Snippet } from 'svelte';

export type RuntimeHTMLRenderable = {
	kind: 'html';
	htmlContentMode: 'void' | 'children';
	tag: string;
};

export type RuntimeComponentRenderable = {
	kind: 'component';
	component: Component<any>;
};

export type RuntimeSnippetRenderable = {
	kind: 'snippet';
	snippet: Snippet<any>;
};

export type RuntimeRenderable = RuntimeHTMLRenderable | RuntimeComponentRenderable | RuntimeSnippetRenderable;

export type RuntimeComposedComponent = {
	kind: 'composed-component' | 'void-composed-component' | 'childed-composed-component';
	renderable: RuntimeRenderable;
	props: unknown;
	content?: Snippet;
};
