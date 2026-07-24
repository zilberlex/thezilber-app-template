import type { Snippet } from 'svelte';

import TestComponent from '$lib/engine/ui-infra/composable-renderable/TestComponent.svelte';
import {
	childedComposedComponent,
	componentRenderable,
	composedComponent,
	htmlRenderable,
	snippetRenderable,
	voidComposedComponent
} from '$lib/engine/ui-infra/composable-renderable';

import type {
	BoundaryComposedComponent,
	BoundaryRendererProps
} from './boundary-types';

declare const content: Snippet;
declare const testSnippet: Snippet<[{ label: string }, Snippet]>;

const html = childedComposedComponent(
	htmlRenderable('button'),
	{ type: 'button' },
	content
);

const input = voidComposedComponent(
	htmlRenderable('input'),
	{ placeholder: 'Name' }
);

const component = composedComponent(
	componentRenderable(TestComponent),
	{ label: 'Component' },
	content
);

const snippet = composedComponent(
	snippetRenderable(testSnippet),
	{ label: 'Snippet' },
	content
);

const htmlBoundary: BoundaryComposedComponent = html;
const inputBoundary: BoundaryComposedComponent = input;
const componentBoundary: BoundaryComposedComponent = component;
const snippetBoundary: BoundaryComposedComponent = snippet;

export const rendererProps: BoundaryRendererProps[] = [
	{ composedComponent: htmlBoundary },
	{ composedComponent: inputBoundary },
	{ composedComponent: componentBoundary },
	{ composedComponent: snippetBoundary }
];
