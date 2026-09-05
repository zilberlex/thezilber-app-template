import { fade, slide, type EasingFunction } from 'svelte/transition';
import { composeTransitions } from './transition-tools/transition-composition/compose-transitions';
import { elasticOut, linear } from 'svelte/easing';

interface FadeAndSlideParams {
	delay?: number;
	fadeDurationMs?: number;
	slideDurationMs?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

export function fadeAndSlide({
	delay = 0,
	fadeDurationMs = 200,
	slideDurationMs = 200,
	easing = linear,
	axis = 'y'
}: FadeAndSlideParams = {}) {
	const outTransition = composeTransitions([
		{
			transition: slide,
			params: {
				delay: 0,
				duration: slideDurationMs,
				axis
			}
		},
		{
			transition: fade,
			params: {
				delay: 0,
				duration: fadeDurationMs
			}
		}
	]);

	return outTransition;
}
