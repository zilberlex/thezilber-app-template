import type { TransitionConfig } from 'svelte/transition';
import type { TransitionParamsCommon } from '../transitions-common';

export type TransitionOptions = { direction: 'in' | 'out' | 'both' };

export type AnyTransition = (node: Element, params?: any, options?: TransitionOptions) => TransitionConfig;

export type TransitionParamsOf<T extends AnyTransition> = NonNullable<Parameters<T>[1]>;

export type SubtransitionParams<T extends AnyTransition> = TransitionParamsOf<T> & TransitionParamsCommon;

export type SubtransitionDefinition<T extends AnyTransition> = { transition: T } & ({} extends TransitionParamsOf<T>
	? { params?: NoInfer<SubtransitionParams<T>> }
	: { params: NoInfer<SubtransitionParams<T>> });

export type SubtransitionDefinitions<Transitions extends Record<string, AnyTransition>> = {
	[Name in keyof Transitions]: SubtransitionDefinition<Transitions[Name]>;
};

/** `duration` scales the whole timeline. */
export type ComposedTransitionParams<
	Transitions extends Record<string, AnyTransition> = Record<string, AnyTransition>
> = TransitionParamsCommon & {
	/** Leaves out the css of subtransitions outside their time. Breaks when two of them set the same property. */
	optimizeCss?: boolean;
	composedParams?: { [Name in keyof Transitions]?: Partial<SubtransitionParams<Transitions[Name]>> };
};

export type ComposedTransition<Transitions extends Record<string, AnyTransition>> = (
	node: Element,
	params?: ComposedTransitionParams<Transitions>,
	options?: TransitionOptions
) => TransitionConfig;
