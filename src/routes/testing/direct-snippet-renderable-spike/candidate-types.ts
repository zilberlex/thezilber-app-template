import type { Snippet } from 'svelte';

import type {
	AnyRenderable,
	ChildCapableRenderable,
	PropsOf,
	RenderableProps
} from '$lib/engine/ui-infra/composable-renderable';

export type EmptyRenderableProps = Record<string, never>;

export type DirectSnippet = Snippet<any>;

export type RenderableInput = AnyRenderable | DirectSnippet;

export type ChildCapableRenderableInput = ChildCapableRenderable | DirectSnippet;

type ExternalProps<Props> = Props extends RenderableProps
	? Omit<Props, 'children'>
	: never;

export type DirectSnippetPropsOf<TRenderable extends DirectSnippet> =
	TRenderable extends Snippet<infer Arguments>
		? Arguments extends []
			? EmptyRenderableProps
			: Arguments extends [infer Props, ...unknown[]]
				? ExternalProps<Props>
				: EmptyRenderableProps
		: never;

export type PropsOfInput<TRenderable extends RenderableInput> =
	TRenderable extends DirectSnippet
		? DirectSnippetPropsOf<TRenderable>
		: TRenderable extends AnyRenderable
			? PropsOf<TRenderable>
			: never;

type RenderableInputPropsField<TRenderable extends RenderableInput> =
	{} extends PropsOfInput<TRenderable>
		? {
				props?: NoInfer<PropsOfInput<TRenderable>>;
			}
		: {
				props: NoInfer<PropsOfInput<TRenderable>>;
			};

type RenderableInputContentField<TRenderable extends RenderableInput> =
	TRenderable extends ChildCapableRenderableInput
		? {
				content?: Snippet;
			}
		: {
				content?: never;
			};

export type DirectRenderableSiteProps<
	TRenderable extends RenderableInput = RenderableInput
> = {
	renderable: TRenderable;
} & RenderableInputPropsField<TRenderable> &
	RenderableInputContentField<TRenderable>;

type PresentRenderableSlotProps<
	TRenderable extends RenderableInput,
	Name extends string
> = {
	[Key in Name]: TRenderable;
} & ({} extends PropsOfInput<TRenderable>
	? {
			[Key in `${Name}Props`]?: NoInfer<PropsOfInput<TRenderable>>;
		}
	: {
			[Key in `${Name}Props`]: NoInfer<PropsOfInput<TRenderable>>;
		});

type AbsentRenderableSlotProps<Name extends string> = {
	[Key in Name | `${Name}Props`]?: never;
};

export type CandidateRenderableSlotProps<
	TRenderable extends RenderableInput,
	Name extends string = 'renderable',
	Required extends boolean = true
> = Required extends true
	? PresentRenderableSlotProps<TRenderable, Name>
	:
			| PresentRenderableSlotProps<TRenderable, Name>
			| AbsentRenderableSlotProps<Name>;

export type DirectFaceSiteProps<
	TFace extends RenderableInput = RenderableInput
> = CandidateRenderableSlotProps<TFace, 'face'>;
