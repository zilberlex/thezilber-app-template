import { linear } from 'svelte/easing';
import { type EasingFunction, type TransitionConfig } from 'svelte/transition';
import type { ComposedTransitionParams } from './compose-transitions-common';
import type { Transition, TransitionParamsCommon } from '../transitions-common';
import { inverseLerp } from '$lib/engine/animation/math-utils';

export interface TransitionItem<P extends TransitionParamsCommon> {
	transition: Transition<P>;
	params: P;
}

/**
 * Resizes an image client-side.
 *
 * @param params – {@link ComposedTransitionParams} describing how to resize.
 * @param transitionFuncAndParams: An array of transition functions and their params.
 * @returns A composed transition function.
 */
export function composeTransitions(
	transitionFuncAndParams: TransitionItem<TransitionParamsCommon>[]
): (node: Element, params?: ComposedTransitionParams) => TransitionConfig {
	return (
		node: Element,
		{
			delay = 0,
			duration = undefined,
			optimizeCss = false,
			reverse = false,
			easing = linear
		}: ComposedTransitionParams = {}
	): TransitionConfig => {
		const transitionsData = transitionFuncAndParams.map((transitionFuncAndParams) =>
			createTransitionData(transitionFuncAndParams.transition, transitionFuncAndParams.params, node)
		);

		const maxTransitionDuration = transitionsData.reduce((max, transition) => {
			const { delay, duration } = transition.params;
			const transitionEnd = (delay ?? 0) + (duration ?? 0);

			return Math.max(max, transitionEnd);
		}, 0);

		// BUG global durtaion vs relative duration needs to be fixed.
		const globalDelay = delay ?? 0;
		const baseLineDuration = maxTransitionDuration;
		const globalDuration = duration ?? baseLineDuration;

		let transitionIndex = 0;
		transitionsData.forEach((transitionData) => {
			transitionData.normalizedStart = transitionData.params.delay / baseLineDuration;
			transitionData.normalizedEnd = (transitionData.params.delay + transitionData.params.duration) / baseLineDuration;
			transitionData.index = transitionIndex++;

			let { originalCss, originalJs, normalizedStart, normalizedEnd, params } = transitionData;

			transitionData.transitionCss = createTranstionCss(
				originalCss,
				normalizedStart,
				normalizedEnd,
				params.easing,
				params.reverse
			);
			transitionData.transitionJs = createTranstionJs(
				originalJs,
				normalizedStart,
				normalizedEnd,
				params.easing,
				params.reverse
			);
		});

		return {
			delay: globalDelay,
			duration: globalDuration,
			easing: easing,
			css: createFullCss(transitionsData, reverse),
			tick: createFullJs(transitionsData, reverse)
		};
	};
}

function createTransitionData(
	transition: (node: Element, params: any) => TransitionConfig,
	params: TransitionParamsCommon,
	node: Element
) {
	const commonPrams = {
		delay: 0,
		duration: 400,
		easing: linear,
		reverse: false,
		...params
	};

	const invocationParams = { ...params };

	delete invocationParams.delay;
	delete invocationParams.duration;
	delete invocationParams.reverse;
	// This is important to be linear as the composition function will apply the easing to the transition by itself.
	invocationParams.easing = linear;

	const { css, tick } = transition(node, invocationParams);

	// const transitionJs: (t: number, u: number) => void = tick
	//                         ?  commonPrams.reverse ? (t, u) => tick(u, t) : tick
	//                         : () => {};

	return {
		name: transition.name,
		originalCss: css,
		originalJs: tick,
		params: commonPrams,
		invocationParams: invocationParams,
		helper: {}
	};
}

function getLocalTandU(tGlobal: number, transitionTStart: number, transitionTend: number) {
	const tLocal = inverseLerp(tGlobal, transitionTStart, transitionTend);
	const uLocal = 1 - tLocal;

	return { tLocal, uLocal };
}

function getLocalLocalTandUWithBl(tGlobal, normalizedStart, normalizedEnd, easing, transitionReverse) {
	let { tLocal, uLocal } = getLocalTandU(tGlobal, normalizedStart, normalizedEnd);

	const originalTLocal: number = tLocal;

	if (tLocal < 0) {
		tLocal = 0;
		uLocal = 1;
	} else if (tLocal > 1) {
		tLocal = 1;
		uLocal = 0;
	} else {
		if (easing) {
			tLocal = easing(tLocal);
			uLocal = 1 - tLocal;
		}
	}

	if (transitionReverse) {
		[tLocal, uLocal] = [uLocal, tLocal];
	}

	return { tLocal, uLocal, originalTLocal };
}

function createTranstionCss(
	transitionCssFunc: (t: number, u: number) => string | undefined,
	normalizedStart,
	normalizedEnd,
	easing,
	transitionReverse: boolean
) {
	if (!transitionCssFunc) return undefined;

	return (tGlobal: number) => {
		const { tLocal, uLocal } = getLocalLocalTandUWithBl(
			tGlobal,
			normalizedStart,
			normalizedEnd,
			easing,
			transitionReverse
		);

		return transitionCssFunc(tLocal, uLocal);
	};
}

function createTranstionJs(
	transitionJsFunc: (t: number, u: number) => string | undefined,
	normalizedStart: number,
	normalizedEnd: number,
	easing: EasingFunction,
	transitionReverse: boolean
) {
	if (!transitionJsFunc) return undefined;

	// This to run tick at t = 0 or t = 1 because these are used to signify transition start.
	// BUG - will cause a bug in transitions that need to run t == 0 and t == 1 only when the transition needs to start at that exact time.
	let didRunJsStart = false;
	let didRunJsEnd = false;

	const OUT_OF_BOUNDS_THRESHOLD = 0.2;

	return (tGlobal: number) => {
		const { tLocal, uLocal, originalTLocal } = getLocalLocalTandUWithBl(
			tGlobal,
			normalizedStart,
			normalizedEnd,
			easing,
			transitionReverse
		);

		const wasOutOfBound = originalTLocal > 1 || originalTLocal < 0;

		// Currently starts the t==0 and t==1 only at Global(Composed) Transition start and end.
		if (tGlobal == 0 && !didRunJsStart) {
			didRunJsStart = true;
			transitionJsFunc(0, 1);
		}
		if (tGlobal == 1 && !didRunJsEnd) {
			didRunJsEnd = true;
			transitionJsFunc(1, 0);
		} else if (tLocal > 0 && tLocal < 1 && !wasOutOfBound) {
			transitionJsFunc(tLocal, uLocal);
		}
	};
}

function createFullCss(transitionRunData, reverse): (tGlobal: number) => string {
	return (tGlobal) => {
		if (reverse) tGlobal = 1 - tGlobal;

		const allTransitionCss = transitionRunData.map(({ transitionCss }) =>
			transitionCss ? transitionCss(tGlobal) : ''
		);

		const fullCssOutput = allTransitionCss.join(';');

		return fullCssOutput;
	};
}

function createFullJs(transitionRunData, globalReverse): (tGlobal: number) => void {
	return (tGlobal: number) => {
		if (globalReverse) tGlobal = 1 - tGlobal;

		transitionRunData.forEach(({ transitionJs }) => {
			if (transitionJs) {
				transitionJs(tGlobal);
			}
		});
	};
}
