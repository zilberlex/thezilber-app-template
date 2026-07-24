import type { Component, Snippet } from 'svelte';

import {
	childedComposedComponent,
	componentRenderable,
	composedComponent,
	htmlRenderable,
	snippetRenderable,
	voidComposedComponent,
	type AnyComposedComponent
} from './candidate-api';

declare const content: Snippet;

declare const testComponent: Component<{
	label: string;
	count?: number;
	children?: Snippet;
}>;

declare const testSnippet: Snippet<[{ label: string }, Snippet]>;

const buttonRenderable = htmlRenderable('button');
const inputRenderable = htmlRenderable('input');
const component = componentRenderable(testComponent);
const snippet = snippetRenderable(testSnippet);

/*
 * Raw HTML strings
 */

composedComponent('button', {
	disabled: true,
	onclick: () => {}
});

composedComponent(
	'button',
	{
		type: 'button'
	},
	content
);

childedComposedComponent(
	'button',
	{
		type: 'button'
	},
	content
);

voidComposedComponent('input', {
	type: 'text',
	placeholder: 'Name'
});

voidComposedComponent('img', {
	src: '/image.png',
	alt: 'Example'
});

// @ts-expect-error button props reject anchor-only attributes
composedComponent('button', {
	href: '/home'
});

// @ts-expect-error input props reject anchor-only attributes
voidComposedComponent('input', {
	href: '/home'
});

// @ts-expect-error button is not a void HTML element
voidComposedComponent('button', {});

// @ts-expect-error input cannot have children
childedComposedComponent('input', {}, content);

// @ts-expect-error input cannot use optional-children composition
composedComponent('input', {});

/*
 * Explicit HTML descriptors
 */

composedComponent(buttonRenderable, {
	disabled: false
});

childedComposedComponent(
	buttonRenderable,
	{
		type: 'button'
	},
	content
);

voidComposedComponent(inputRenderable, {
	type: 'text'
});

/*
 * Reuse is optional
 */

composedComponent(htmlRenderable('button'), {});
composedComponent(htmlRenderable('button'), {});

voidComposedComponent(htmlRenderable('input'), {});
voidComposedComponent(htmlRenderable('input'), {});

/*
 * Component props
 */

composedComponent(component, {
	label: 'Hello'
});

childedComposedComponent(
	component,
	{
		label: 'With content'
	},
	content
);

voidComposedComponent(component, {
	label: 'Contentless component'
});

// @ts-expect-error required component prop is missing
composedComponent(component, {
	count: 1
});

// @ts-expect-error unknown component prop
composedComponent(component, {
	label: 'Hello',
	unknown: true
});

// @ts-expect-error children is infrastructure-owned
composedComponent(component, {
	label: 'Hello',
	children: content
});

/*
 * Snippet props
 */

childedComposedComponent(
	snippet,
	{
		label: 'Snippet'
	},
	content
);

composedComponent(
	snippet,
	{
		label: 'Optional snippet content'
	},
	content
);

// @ts-expect-error wrong snippet props
childedComposedComponent(
	snippet,
	{
		value: 123
	},
	content
);

/*
 * Umbrella union
 */

export const composedComponents: AnyComposedComponent[] = [
	composedComponent('button', {
		disabled: true
	}),
	childedComposedComponent(
		buttonRenderable,
		{
			type: 'button'
		},
		content
	),
	voidComposedComponent('input', {
		type: 'text'
	}),
	composedComponent(component, {
		label: 'Component'
	}),
	childedComposedComponent(
		snippet,
		{
			label: 'Snippet'
		},
		content
	)
];
