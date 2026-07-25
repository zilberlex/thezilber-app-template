import type { AnyRenderable, RenderableProps } from './types';

export function assertRenderableProps(
	props: unknown
): asserts props is RenderableProps {
	if (
		typeof props !== 'object' ||
		props === null ||
		Array.isArray(props)
	) {
		throw new Error('Composable renderable props must be an object.');
	}

	if ('children' in props) {
		throw new Error(
			'Renderable props must not contain "children". Pass injected content through the content prop.'
		);
	}
}

export function assertRenderableContent(
	renderable: AnyRenderable,
	content: unknown
): void {
	if (
		renderable.kind === 'html' &&
		renderable.htmlContentMode === 'void' &&
		content !== undefined
	) {
		throw new Error(
			`Cannot provide content to void HTML element <${renderable.tag}>.`
		);
	}
}
