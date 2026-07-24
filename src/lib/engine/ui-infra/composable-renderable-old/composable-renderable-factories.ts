import type { Component } from 'svelte';

import type { AcceptsChildren } from './composable-renderable-internal';

import {
	RENDERABLE_CONTENT_MODE,
	RENDERABLE_KIND,
	type RenderableComponent,
	type ContentMode,
	type RenderableHTML,
	type HTMLTag,
	type SurfaceHTMLTag
} from './types';

function createHTMLRenderable<const Tag extends HTMLTag, Mode extends ContentMode>(
	html: Tag,
	mode: Mode
): RenderableHTML<Tag, Mode> {
	return {
		[RENDERABLE_KIND]: 'html',
		[RENDERABLE_CONTENT_MODE]: mode,
		html
	};
}

function createComponentRenderable<TComponent extends Component<any>, Mode extends ContentMode>(
	component: TComponent,
	mode: Mode
): RenderableComponent<TComponent, Mode> {
	return {
		[RENDERABLE_KIND]: 'component',
		[RENDERABLE_CONTENT_MODE]: mode,
		component
	};
}

export function htmlRenderable<const Tag extends HTMLTag>(html: Tag): RenderableHTML<Tag, 'optional'> {
	return createHTMLRenderable(html, 'optional');
}

export function htmlSurface<const Tag extends SurfaceHTMLTag>(html: Tag): RenderableHTML<Tag, 'required'> {
	return createHTMLRenderable(html, 'required');
}

/**
 * Creates an optional-content component renderable.
 *
 * The component does not need to accept children.
 */
export function componentRenderable<TComponent extends Component<any>>(
	component: TComponent
): RenderableComponent<TComponent, 'optional'> {
	return createComponentRenderable(component, 'optional');
}

/**
 * Creates a required-content component surface.
 *
 * The component must expose a compatible children snippet prop because the
 * renderer injects the selected face into it.
 */
export function componentSurface<SurfaceComponent extends Component<any>>(
	component: SurfaceComponent & AcceptsChildren<SurfaceComponent>
): RenderableComponent<SurfaceComponent, 'required'> {
	return createComponentRenderable(component, 'required');
}
