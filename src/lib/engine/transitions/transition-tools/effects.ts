import { linear } from 'svelte/easing';
import { pulse, type FilterEffectTransitionParams } from './transitions-common';
import type { TransitionConfig } from 'svelte/transition';
import { lerp } from '$lib/engine/math-utils/math-utils';

function makeFilter(filterName: string, filterVal: number, units: string) {
	return `${filterName}(${filterVal}${units})`;
}

export function makeFilterFunction(
	filterName: string,
	peakVal: number,
	baseVal: number,
	units: string,
	yoyo?: boolean
) {
	return (t_eased: number) => {
		const t_final = yoyo ? pulse(t_eased) : t_eased;

		const filterVal = lerp(baseVal, peakVal, t_final);
		const filter = makeFilter(filterName, filterVal, units);

		return filter;
	};
}

export function filterEffectTransition(
	node: HTMLElement,
	{
		filterName = undefined,
		delay = 0,
		duration = 600,
		easing = linear,
		yoyo = true,
		baseVal = 1,
		peakVal = 2.5,
		units = ''
	} = {} as FilterEffectTransitionParams
): TransitionConfig {
	if (!filterName) {
		throw new Error('filterName is required');
	}

	const filterFunction = makeFilterFunction(filterName, peakVal, baseVal, units, yoyo);

	return {
		delay,
		duration,
		easing,
		css: (t_eased: number) => `filter: ${filterFunction(t_eased)}`
	};
}
