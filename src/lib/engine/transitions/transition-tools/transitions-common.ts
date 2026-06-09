import { lerp } from '$lib/engine/animation/math-utils';
import { linear } from 'svelte/easing';
import type { EasingFunction, TransitionConfig } from 'svelte/transition';

export type TransitionParamsCommon = {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	reverse?: boolean;
};

export type Transition<P extends TransitionParamsCommon = TransitionParamsCommon> = (
	node: Element,
	params?: P
) => TransitionConfig;

export type FilterEffectTransitionParams = TransitionParamsCommon & {
	filterName: string;
	yoyo?: boolean;
	baseVal?: number;
	peakVal?: number;
	units?: string;
};

/** Creates a triangle wave easing function */
export const pulse = (t_linear: number) => (t_linear < 0.5 ? 2 * t_linear : 2 - 2 * t_linear);

/** Creates an eased triangle wave */
export const pulseEase = (e1: EasingFunction) => (t_linear: number) => e1(pulse(t_linear));

export const lerpPulseEase = (a: number, b: number, easing: EasingFunction) => (t_linear: number) =>
	lerp(a, b, pulseEase(easing)(t_linear));

export const linearPulse = (baseVale: number, peakVal: number) => lerpPulseEase(baseVale, peakVal, linear);
