import type { Component, ComponentProps, Snippet } from 'svelte';

import type {
	HTMLTagForMode,
	HTMLTagProps,
	InternalContentMode,
	InternalHTMLTag,
	InternalSurfaceHTMLTag,
	InternalVoidHTMLTag,
	WithoutChildren
} from './composable-renderable-internal';

/**
 * Runtime descriptor fields.
 *
 * Symbols prevent collisions with ordinary user objects and component props.
 */
export const RENDERABLE_KIND: unique symbol = Symbol('renderable-kind');

export const RENDERABLE_CONTENT_MODE: unique symbol = Symbol('renderable-content-mode');

export type AnyRenderableProps = Record<string, any>;

export type HTMLTag = InternalHTMLTag;

export type VoidHTMLTag = InternalVoidHTMLTag;

export type SurfaceHTMLTag = InternalSurfaceHTMLTag;

export type ContentMode = InternalContentMode;

/**
 * Context passed to a renderable snippet.
 *
 * Surface snippets always receive content.
 * Face snippets may be rendered without injected content.
 */
export type RenderableSnippetContext<Props, Mode extends ContentMode> = {
	props: Props;
} & (Mode extends 'required'
	? {
			content: Snippet;
		}
	: {
			content?: Snippet;
		});

/**
 * A snippet that participates in the composable-renderable API.
 */
export type RenderableSnippet<Props = Record<string, never>, Mode extends ContentMode = 'optional'> = Snippet<
	[context: RenderableSnippetContext<Props, Mode>]
>;

/**
 * A renderable snippet used as a surface.
 *
 * Its content is always provided by the renderer.
 */
export type SurfaceSnippet<Props = Record<string, never>> = RenderableSnippet<Props, 'required'>;

/**
 * A renderable snippet used as a face.
 *
 * No content is automatically injected into it.
 */
export type FaceSnippet<Props = Record<string, never>> = RenderableSnippet<Props, 'optional'>;

/**
 * Explicit HTML renderable descriptor.
 */
export type RenderableHTML<Tag extends HTMLTag = HTMLTag, Mode extends ContentMode = 'optional'> = {
	[RENDERABLE_KIND]: 'html';
	[RENDERABLE_CONTENT_MODE]: Mode;
	html: Tag;
};

/**
 * Explicit component renderable descriptor.
 */
export type RenderableComponent<
	RenderableComponent extends Component<any> = Component<any>,
	Mode extends ContentMode = 'optional'
> = {
	[RENDERABLE_KIND]: 'component';
	[RENDERABLE_CONTENT_MODE]: Mode;
	component: RenderableComponent;
};

/**
 * The single source of truth for all supported renderable forms.
 *
 * The conditional distributes over ContentMode unions, so:
 *
 * Renderable<'required' | 'optional'>
 *
 * becomes the union of the correctly constrained required and optional forms.
 */
export type Renderable<Mode extends ContentMode> = Mode extends ContentMode
	?
			| HTMLTagForMode<Mode>
			| RenderableSnippet<any, Mode>
			| RenderableHTML<HTMLTagForMode<Mode>, Mode>
			| RenderableComponent<any, Mode>
	: never;

export type Surface = Renderable<'required'>;

export type Face = Renderable<'optional'> | Snippet;

export type AnyRenderable = Surface | Face;

export type RenderableDescriptor = Extract<
	AnyRenderable,
	{
		[RENDERABLE_KIND]: 'html' | 'component';
	}
>;

export type AnyHTMLRenderable = Extract<
	RenderableDescriptor,
	{
		[RENDERABLE_KIND]: 'html';
	}
>;

export type AnyComponentRenderable = Extract<
	RenderableDescriptor,
	{
		[RENDERABLE_KIND]: 'component';
	}
>;

type RenderableProps<TRenderable extends AnyRenderable, Mode extends ContentMode> = TRenderable extends HTMLTag
	? HTMLTagProps<TRenderable>
	: TRenderable extends RenderableHTML<infer Tag, Mode>
		? HTMLTagProps<Tag>
		: TRenderable extends RenderableComponent<infer RenderableComponent, Mode>
			? Mode extends 'required'
				? WithoutChildren<ComponentProps<RenderableComponent>>
				: ComponentProps<RenderableComponent>
			: TRenderable extends RenderableSnippet<infer Props, Mode>
				? Props
				: TRenderable extends Snippet
					? Record<string, never>
					: never;

export type RenderableSurfaceProps<TSurface extends Surface> = RenderableProps<TSurface, 'required'>;

export type RenderableFaceProps<TFace extends Face> = RenderableProps<TFace, 'optional'>;

export type SurfaceProps<TSurface extends Surface, Required extends boolean = true> = Required extends true
	? {
			surface: TSurface;
			surfaceProps?: NoInfer<RenderableSurfaceProps<TSurface>>;
		}
	: {
			surface?: TSurface;
			surfaceProps?: NoInfer<RenderableSurfaceProps<TSurface>>;
		};

export type FaceChildrenProps<TFace extends Face> =
	| {
			face: TFace;
			faceProps?: NoInfer<RenderableFaceProps<TFace>>;
			children?: never;
	  }
	| {
			face?: never;
			faceProps?: never;
			children: Snippet;
	  };

export type NamedFaceProps<Name extends string, TFace extends Face> =
	| ({
			[Key in Name]: TFace;
	  } & {
			[Key in `${Name}Props`]?: NoInfer<RenderableFaceProps<TFace>>;
	  })
	| ({
			[Key in Name]?: never;
	  } & {
			[Key in `${Name}Props`]?: never;
	  });

export function isRenderableDescriptor(renderable: unknown): renderable is RenderableDescriptor {
	return typeof renderable === 'object' && renderable !== null && RENDERABLE_KIND in renderable;
}

function isRenderableKind<Kind extends RenderableDescriptor[typeof RENDERABLE_KIND]>(
	renderable: AnyRenderable,
	kind: Kind
): renderable is Extract<
	RenderableDescriptor,
	{
		[RENDERABLE_KIND]: Kind;
	}
> {
	return isRenderableDescriptor(renderable) && renderable[RENDERABLE_KIND] === kind;
}

export type RuntimeRenderable = string | Snippet | RenderableDescriptor;

export function isComponentRenderable(renderable: AnyRenderable): renderable is AnyComponentRenderable {
	return isRenderableKind(renderable, 'component');
}

export function isHTMLRenderable(renderable: AnyRenderable): renderable is AnyHTMLRenderable {
	return isRenderableKind(renderable, 'html');
}
