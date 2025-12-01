import { animationControl } from '../animation-control';
import type { AnimationControl } from '../animation.types';
import { lerp } from '../math-utils';
import { createNumberByDigitsTween } from './animate-number-by-digits';
import { createLerpTween } from './lerp-tween';

export type ValCb = (tweenedVal: number) => void;

export type TBasedAnimationParams = { duration: number };
export type TweenAnimationParams = TBasedAnimationParams & { from: number; to: number };

export function tweenValue(
	valCb: ValCb,
	initialParams: TweenAnimationParams
): AnimationControl<TweenAnimationParams> {
	const { from, to } = initialParams;

	const lerpTween = createLerpTween(from, to);

	return createAnimationControlTween(lerpTween, valCb, initialParams);
}

export function animateNumberByDigits(
	valCb: ValCb,
	initialParams: TweenAnimationParams
): AnimationControl<TweenAnimationParams> {
	const { from, to } = initialParams;

	const animatedNumberTween = createNumberByDigitsTween(from, to);

	return createAnimationControlTween(animatedNumberTween, valCb, initialParams);
}

export function createAnimationControlTween<T extends TBasedAnimationParams>(
	tweeningFunction: (t: number) => number,
	valCb: (v: number) => void,
	initialParams: T
): AnimationControl<T> {
	return createTBasedAnimationControl((t, _params) => {
		valCb(tweeningFunction(t));
	}, initialParams);
}

export function createTBasedAnimationControl<T extends TBasedAnimationParams>(
	animation: (t: number, params: T) => void,
	initialParams: T
): AnimationControl<T> {
	return animationControl((_, elapsed, _ctl, params) => {
		const t = Math.min(elapsed / params.duration, 1);

		animation(t, params);

		return t < 1;
	}, initialParams);
}
