import type { AnimationTween } from '../animation.types';
import { lerp } from '../math-utils';

export function createLerpTween(from: number, to: number): AnimationTween {
	return (t: number) => lerp(from, to, t);
}
