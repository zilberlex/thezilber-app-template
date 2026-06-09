import { fade, slide, type EasingFunction } from 'svelte/transition';
import { composeTransitions } from './transition-tools/transition-composition/compose-transitions';
import { elasticOut, linear } from 'svelte/easing';

interface FadeAndSlideParams {
	delay?: number;
	fadeDurationMs?: number;
	slideDurationMs?: number;
	easing?: EasingFunction;
}

export function fadeAndSlide({
	delay = 0,
	fadeDurationMs = 200,
	slideDurationMs = 200,
	easing = linear
}: FadeAndSlideParams = {}) {
	const outTransition = composeTransitions([
		{
			transition: slide,
			params: {
				delay: 0,
				duration: slideDurationMs
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
