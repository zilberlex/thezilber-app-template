import type { AnimationTween } from '../animation.types';
import { lerp } from '$lib/packages/core/math/math-utils';

export function createLerpTween(from: number, to: number): AnimationTween {
	return (t: number) => lerp(from, to, t);
}
