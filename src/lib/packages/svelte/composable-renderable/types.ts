import type { Component, Snippet } from 'svelte';

declare const RENDERABLE_PROPS: unique symbol;

export type RenderableProps = Record<string, any>;

export type RenderableSnippet<Props extends RenderableProps = RenderableProps> = Snippet<
	[props: Props, content?: Snippet]
>;

export type HTMLTag = keyof HTMLElementTagNameMap | 'param';

export type VoidHTMLTag =
	| 'area'
	| 'base'
	| 'br'
	| 'col'
	| 'embed'
	| 'hr'
	| 'img'
	| 'input'
	| 'link'
	| 'meta'
	| 'param'
	| 'source'
	| 'track'
	| 'wbr';

export type ChildedHTMLTag = Exclude<HTMLTag, VoidHTMLTag>;

type ExternalProps<Props extends RenderableProps> = Props extends unknown ? Omit<Props, 'children'> : never;

type SnippetFirstArgument<RenderableSnippet extends Snippet<any>> =
	RenderableSnippet extends Snippet<infer Arguments>
		? Arguments extends [infer Props, ...unknown[]]
			? Props extends RenderableProps
				? Props
				: never
			: Record<string, never>
		: never;

type RenderablePropsCarrier<Props> = {
	readonly [RENDERABLE_PROPS]?: Props;
};

export type VoidHTMLRenderable<Tag extends VoidHTMLTag = VoidHTMLTag> = {
	kind: 'html';
	htmlContentMode: 'void';
	tag: Tag;
} & RenderablePropsCarrier<RenderableProps>;

export type ChildedHTMLRenderable<Tag extends ChildedHTMLTag = ChildedHTMLTag> = {
	kind: 'html';
	htmlContentMode: 'children';
	tag: Tag;
} & RenderablePropsCarrier<RenderableProps>;

export type HTMLRenderable<Tag extends HTMLTag = HTMLTag> = Tag extends VoidHTMLTag
	? VoidHTMLRenderable<Tag>
	: Tag extends ChildedHTMLTag
		? ChildedHTMLRenderable<Tag>
		: never;

export type ComponentRenderable<Props extends RenderableProps = RenderableProps> = {
	kind: 'component';
	component: Component<Props>;
} & RenderablePropsCarrier<ExternalProps<Props>>;

export type SnippetRenderable<Props extends RenderableProps = RenderableProps> = {
	kind: 'snippet';
	snippet: RenderableSnippet<Props>;
} & RenderablePropsCarrier<ExternalProps<Props>>;

export type AnyHTMLRenderable = VoidHTMLRenderable | ChildedHTMLRenderable;

export type ExplicitRenderable = AnyHTMLRenderable | ComponentRenderable<any> | SnippetRenderable<any>;

export type ExplicitChildCapableRenderable = ChildedHTMLRenderable | ComponentRenderable<any> | SnippetRenderable<any>;

export type ExplicitVoidCapableRenderable = VoidHTMLRenderable | ComponentRenderable<any> | SnippetRenderable<any>;

export type AnyRenderable = ExplicitRenderable | Snippet<any>;

export type ChildCapableRenderable = ExplicitChildCapableRenderable | Snippet<any>;

export type VoidCapableRenderable = ExplicitVoidCapableRenderable | Snippet<any>;

export type PropsOf<Renderable extends AnyRenderable> = Renderable extends ExplicitRenderable
	? Renderable extends RenderablePropsCarrier<infer Props>
		? Props
		: never
	: Renderable extends Snippet<any>
		? ExternalProps<SnippetFirstArgument<Renderable>>
		: never;

type ComposedComponentPropsField<Renderable extends AnyRenderable> =
	{} extends PropsOf<Renderable>
		? {
				props?: NoInfer<PropsOf<Renderable>>;
			}
		: {
				props: NoInfer<PropsOf<Renderable>>;
			};

export type ComposedComponentProps<Renderable extends AnyRenderable = AnyRenderable> = {
	renderable: Renderable;
	content?: Renderable extends VoidHTMLRenderable ? never : Snippet;
} & ComposedComponentPropsField<Renderable>;

type RenderableSlotPropsField<Renderable extends AnyRenderable, Name extends string> =
	{} extends PropsOf<Renderable>
		? {
				[Key in `${Name}Props`]?: NoInfer<PropsOf<Renderable>>;
			}
		: {
				[Key in `${Name}Props`]: NoInfer<PropsOf<Renderable>>;
			};

type PresentRenderableSlotProps<Renderable extends AnyRenderable, Name extends string> = {
	[Key in Name]: Renderable;
} & RenderableSlotPropsField<Renderable, Name>;

type AbsentRenderableSlotProps<Name extends string> = {
	[Key in Name | `${Name}Props`]?: never;
};

export type RenderableSlotProps<
	Renderable extends AnyRenderable,
	Name extends string = 'renderable',
	Required extends boolean = true
> = Required extends true
	? PresentRenderableSlotProps<Renderable, Name>
	: PresentRenderableSlotProps<Renderable, Name> | AbsentRenderableSlotProps<Name>;
