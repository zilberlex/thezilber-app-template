import type { TransitionConfig } from 'svelte/transition';
import type { TransitionParamsCommon } from '../transitions-common';

/** The third argument Svelte passes to a transition. */
export type TransitionOptions = { direction: 'in' | 'out' | 'both' };

export type AnyTransition = (node: Element, params?: any, options?: TransitionOptions) => TransitionConfig;

export type TransitionParamsOf<T extends AnyTransition> = NonNullable<Parameters<T>[1]>;

/** A subtransition's own params, plus where it sits on the composed timeline. */
export type SubtransitionParams<T extends AnyTransition> = TransitionParamsOf<T> & TransitionParamsCommon;

/** `params` may be left out only when the transition has no required params. */
export type SubtransitionDefinition<T extends AnyTransition> = { transition: T } & ({} extends TransitionParamsOf<T>
	? { params?: NoInfer<SubtransitionParams<T>> }
	: { params: NoInfer<SubtransitionParams<T>> });

export type SubtransitionDefinitions<Transitions extends Record<string, AnyTransition>> = {
	[Name in keyof Transitions]: SubtransitionDefinition<Transitions[Name]>;
};

/**
 * `delay` is added to every subtransition's delay. `duration` scales the whole timeline; without it,
 * the timeline ends when the last subtransition ends. `reverse` plays the timeline backwards.
 */
export type ComposedTransitionParams<
	Transitions extends Record<string, AnyTransition> = Record<string, AnyTransition>
> = TransitionParamsCommon & {
	/** Leaves out the css of subtransitions outside their time. Breaks when two of them set the same property. */
	optimizeCss?: boolean;
	/** Merged, one subtransition at a time, over the params given when composing. */
	composedParams?: { [Name in keyof Transitions]?: Partial<SubtransitionParams<Transitions[Name]>> };
};

export type ComposedTransition<Transitions extends Record<string, AnyTransition>> = (
	node: Element,
	params?: ComposedTransitionParams<Transitions>,
	options?: TransitionOptions
) => TransitionConfig;
