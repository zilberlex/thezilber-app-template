import type { TransitionConfig } from 'svelte/transition';
import type { TransitionParamsCommon } from '../transitions-common';

export type TransitionOptions = { direction: 'in' | 'out' | 'both' };

export type AnyTransition = (node: Element, params?: any, options?: TransitionOptions) => TransitionConfig;

export type TransitionsByName = Record<string, AnyTransition>;

export type TransitionParamsOf<T extends AnyTransition> = NonNullable<Parameters<T>[1]>;

export type SubtransitionParams<T extends AnyTransition> = TransitionParamsOf<T> & TransitionParamsCommon;

export type SubtransitionDefinition<T extends AnyTransition> = { transition: T } & ({} extends TransitionParamsOf<T>
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
