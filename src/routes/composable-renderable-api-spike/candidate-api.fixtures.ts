import type { Component, Snippet } from 'svelte';
import {
	componentRenderable,
	contentlessSurface,
	htmlRenderable,
	optionalSurface,
	requiredSurface,
	snippetRenderable,
	type Surface
} from './candidate-api';

declare const content: Snippet;
declare const testComponent: Component<{
	label: string;
	count?: number;
	children?: Snippet;
}>;
declare const testSnippet: Snippet<[{ label: string }, Snippet]>;

const button = htmlRenderable('button');
const anchor = htmlRenderable('a');
const input = htmlRenderable('input');
const component = componentRenderable(testComponent);
const snippet = snippetRenderable(testSnippet);

contentlessSurface(button, { type: 'button', disabled: true });
contentlessSurface(anchor, { href: '/home' });
contentlessSurface(input, { type: 'text' });

// @ts-expect-error button props must reject anchor-only attributes
contentlessSurface(button, { href: '/home' });

// @ts-expect-error input props must reject anchor-only attributes
contentlessSurface(input, { href: '/home' });

contentlessSurface(component, { label: 'Hello' });

// @ts-expect-error label is required
contentlessSurface(component, { count: 1 });

// @ts-expect-error unknown component prop
contentlessSurface(component, { label: 'Hello', unknown: true });

// @ts-expect-error children is infrastructure-owned
contentlessSurface(component, { label: 'Hello', children: content });

requiredSurface(snippet, { label: 'Hello' }, content);

// @ts-expect-error wrong snippet props
requiredSurface(snippet, { value: 123 }, content);

requiredSurface(component, { label: 'Required' }, content);
optionalSurface(component, { label: 'Optional' });
optionalSurface(component, { label: 'Optional with content' }, content);
contentlessSurface(component, { label: 'Contentless' });

// @ts-expect-error required content is missing
requiredSurface(component, { label: 'Missing content' });

// @ts-expect-error contentless surfaces reject content
contentlessSurface(component, { label: 'No content' }, content);

export const surfaces: Surface[] = [
	contentlessSurface(button, { type: 'button' }),
	optionalSurface(component, { label: 'Component' }, content),
	requiredSurface(snippet, { label: 'Snippet' }, content)
];
