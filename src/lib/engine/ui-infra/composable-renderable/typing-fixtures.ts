import type { Snippet } from 'svelte';
import TestComponent from './TestComponent.svelte';
import {
	childedComposedComponent,
	componentRenderable,
	composedComponent,
	composedComponents,
	htmlRenderable,
	snippetRenderable,
	voidComposedComponent
} from './composable-renderable-factories';
import type { AnyComposedComponent } from './composable-renderable';

declare const content: Snippet;
declare const testSnippet: Snippet<[{ label: string }, Snippet]>;
const button = htmlRenderable('button');
const input = htmlRenderable('input');
const component = componentRenderable(TestComponent);
const snippet = snippetRenderable(testSnippet);

composedComponent(button, { disabled: true, onclick: () => {} });
childedComposedComponent(button, { type: 'button' }, content);
voidComposedComponent(input, { type: 'text', placeholder: 'Name' });
// @ts-expect-error button props reject anchor-only attributes
composedComponent(button, { href: '/home' });
// @ts-expect-error input props reject anchor-only attributes
voidComposedComponent(input, { href: '/home' });
// @ts-expect-error button is not a void HTML element
voidComposedComponent(button, {});
// @ts-expect-error input cannot use optional children
composedComponent(input, {});
// @ts-expect-error input cannot have required children
childedComposedComponent(input, {}, content);
composedComponent(htmlRenderable('button'), {});
voidComposedComponent(htmlRenderable('input'), {});
composedComponent(component, { label: 'Hello' });
childedComposedComponent(component, { label: 'With content' }, content);
voidComposedComponent(component, { label: 'No content' });
// @ts-expect-error required component prop is missing
composedComponent(component, { count: 1 });
// @ts-expect-error unknown component prop
composedComponent(component, { label: 'Hello', unknown: true });
// @ts-expect-error children is infrastructure-owned
composedComponent(component, { label: 'Hello', children: content });
composedComponent(snippet, { label: 'Optional content' });
childedComposedComponent(snippet, { label: 'Required content' }, content);
voidComposedComponent(snippet, { label: 'No content' });
// @ts-expect-error wrong snippet props
childedComposedComponent(snippet, { value: 123 }, content);
export const items: AnyComposedComponent[] = [
	composedComponent(button, {}),
	voidComposedComponent(input, {}),
	composedComponent(component, { label: 'Component' }),
	childedComposedComponent(snippet, { label: 'Snippet' }, content)
];
export const tuple = composedComponents(
	composedComponent(button, {}),
	voidComposedComponent(input, {}),
	childedComposedComponent(snippet, { label: 'Snippet' }, content)
);
