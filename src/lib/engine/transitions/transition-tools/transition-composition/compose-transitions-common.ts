import type { TransitionConfig } from 'svelte/transition';
import type { Transition, TransitionOptions, TransitionParamsCommon } from '../transitions-common';

export type TransitionsByName = Record<string, Transition<any>>;

export type TransitionParamsOf<T extends Transition<any>> = NonNullable<Parameters<T>[1]>;

export type SubtransitionParams<T extends Transition<any>> = TransitionParamsOf<T> & TransitionParamsCommon;

export type SubtransitionDefinition<T extends Transition<any>> = { transition: T } & ({} extends TransitionParamsOf<T>
	? { params?: NoInfer<SubtransitionParams<T>> }
	: { params: NoInfer<SubtransitionParams<T>> });

export type SubtransitionDefinitions<TTransitions extends TransitionsByName> = {
	[K in keyof TTransitions]: SubtransitionDefinition<TTransitions[K]>;
};

export type ComposedTransitionParams<TTransitions extends TransitionsByName = TransitionsByName> =
	TransitionParamsCommon & {
		optimizeCss?: boolean;
		composedParams?: { [K in keyof TTransitions]?: Partial<SubtransitionParams<TTransitions[K]>> };
	};

export type ComposedTransition<TTransitions extends TransitionsByName> = (
	node: Element,
	params?: ComposedTransitionParams<TTransitions>,
	options?: TransitionOptions
) => TransitionConfig;
